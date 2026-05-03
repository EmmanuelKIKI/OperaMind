import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase.js';
import { today } from './storage.js';

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function empty() {
  return { orders: [], products: [], revenues: [], costs: [], tickets: [], goals: null };
}

export function AppProvider({ children }) {
  const [profile,       setProfile]       = useState(null);
  const [allProfiles,   setAllProfiles]   = useState([]);
  const [impersonating, setImpersonating] = useState(null);
  const [pendingEmail,  setPendingEmail]  = useState(null);
  const [cache,         setCache]         = useState({});
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState('operations');
  const [modal,         setModal]         = useState(null);
  const [toast,         setToast]         = useState(null);
  const toastRef = useRef(null);

  const activeProfile = impersonating || profile;
  const activeId      = activeProfile?.id ?? null;
  const isAdmin = profile?.is_admin === true && !impersonating;
  const isPro   = useCallback(
    () => (impersonating?.plan ?? profile?.plan) === 'pro',
    [impersonating, profile]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'EMAIL_CONFIRMED' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'MFA_CHALLENGE_VERIFIED'
      ) {
        if (session?.user) fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setCache({});
        setLoading(false);
      } else if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();

    if (data) {
      setProfile(data);
      setLoading(false);
      if (data.is_admin) loadAllProfiles();
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.name
        || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
        || user.email?.split('@')[0]
        || 'Utilisateur';

      const { data: inserted } = await supabase.from('profiles').upsert({
        id: uid,
        name,
        email: user.email,
        plan: 'free',
        is_admin: false,
        status: 'active',
      }, { onConflict: 'id' }).select().single();

      setProfile(inserted || null);
      setLoading(false);
      if (inserted?.is_admin) loadAllProfiles();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }

  async function loadUserData(uid) {
    if (cache[uid]) return cache[uid];
    const [o, p, r, c, t, g] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('user_id', uid).order('id'),
      supabase.from('revenues').select('*').eq('user_id', uid).order('date'),
      supabase.from('costs').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('tickets').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const d = {
      orders:   o.data || [],
      products: p.data || [],
      revenues: (r.data || []).map(x => ({ date: x.date, amount: x.amount, _id: x.id })),
      costs:    c.data || [],
      tickets:  t.data || [],
      goals:    g.data ? { revenueTarget: g.data.revenue_target, month: g.data.month } : null,
    };
    setCache(prev => ({ ...prev, [uid]: d }));
    return d;
  }

  function invalidate(uid) { setCache(p => { const n = { ...p }; delete n[uid]; return n; }); }

  useEffect(() => { if (activeId) loadUserData(activeId); }, [activeId]);

  function getUD() { return cache[activeId] || empty(); }

  async function refreshUD() {
    if (!activeId) return;
    invalidate(activeId);
    await loadUserData(activeId);
  }

  async function addOrder(o) {
    const d = getUD();
    if (!isPro() && d.orders.length >= 50) { showToast('Limite 50 commandes atteinte. Passez à Pro.', 'err'); return false; }
    const { error } = await supabase.from('orders').insert({
      user_id: activeId, name: o.name, amount: o.amount,
      product: o.product || null, stage: o.stage || 'Prospect',
      status: o.status || 'En cours', date: o.date || today(),
    });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    await refreshUD(); showToast('Commande ajoutée', 'ok'); return true;
  }

  async function deleteOrder(id) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) { showToast('Erreur suppression : ' + error.message, 'err'); return; }
    await refreshUD(); showToast('Commande supprimée', 'ok');
  }

  async function updateOrderStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { showToast('Erreur mise à jour : ' + error.message, 'err'); return; }
    await refreshUD();
  }

  async function addProduct(p) {
    const d = getUD();
    if (!isPro() && d.products.length >= 15) { showToast('Limite 15 produits atteinte. Passez à Pro.', 'err'); return false; }
    const { error } = await supabase.from('products').insert({
      user_id: activeId, name: p.name, price: p.price, stock: p.stock, category: p.category || 'Service',
    });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    await refreshUD(); showToast('Produit ajouté', 'ok'); return true;
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast('Erreur suppression : ' + error.message, 'err'); return; }
    await refreshUD(); showToast('Produit supprimé', 'ok');
  }

  async function updateProductStock(id, stock) {
    const { error } = await supabase.from('products').update({ stock }).eq('id', id);
    if (error) { showToast('Erreur mise à jour : ' + error.message, 'err'); return; }
    await refreshUD();
  }

  async function addRevenue(amount, date) {
    const { error } = await supabase.from('revenues').insert({ user_id: activeId, amount, date: date || today() });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    await refreshUD(); showToast('Revenu enregistré', 'ok'); return true;
  }

  async function deleteRevenue(dbId) {
    const { error } = await supabase.from('revenues').delete().eq('id', dbId);
    if (error) { showToast('Erreur suppression : ' + error.message, 'err'); return; }
    await refreshUD();
  }

  async function addCost(c) {
    const { error } = await supabase.from('costs').insert({
      user_id: activeId, name: c.name, amount: c.amount, type: c.type || 'Fixe', date: c.date || today(),
    });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    await refreshUD(); showToast('Coût enregistré', 'ok'); return true;
  }

  async function deleteCost(id) {
    const { error } = await supabase.from('costs').delete().eq('id', id);
    if (error) { showToast('Erreur suppression : ' + error.message, 'err'); return; }
    await refreshUD(); showToast('Coût supprimé', 'ok');
  }

  async function addTicket(t) {
    if (!isPro()) {
      const d = getUD();
      const thisMonth = new Date().toISOString().slice(0, 7);
      const ticketsThisMonth = d.tickets.filter(tk => (tk.date || '').startsWith(thisMonth));
      if (ticketsThisMonth.length >= 5) {
        showToast('Limite 5 tickets/mois atteinte. Passez à Pro.', 'err');
        return false;
      }
    }
    const { error } = await supabase.from('tickets').insert({
      user_id: activeId, title: t.title, priority: t.priority || 'Moyenne',
      description: t.desc || null, status: 'Ouvert', date: today(),
    });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    await refreshUD(); showToast('Ticket créé', 'ok'); return true;
  }

  async function updateTicketStatus(id, status) {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (error) { showToast('Erreur mise à jour : ' + error.message, 'err'); return; }
    await refreshUD();
  }

  async function deleteTicket(id) {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) { showToast('Erreur suppression : ' + error.message, 'err'); return; }
    await refreshUD(); showToast('Ticket supprimé', 'ok');
  }

  async function setGoal(target, month) {
    const { error } = await supabase.from('goals').upsert(
      { user_id: activeId, revenue_target: target, month },
      { onConflict: 'user_id,month' }
    );
    if (error) { showToast('Erreur : ' + error.message, 'err'); return; }
    await refreshUD(); showToast('Objectif enregistré', 'ok');
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) { showToast('Email ou mot de passe incorrect', 'err'); return false; }
    return true;
  }

  async function register(firstName, lastName, email, password) {
    const e = email.trim().toLowerCase();
    if (!firstName || !lastName || !e || !password) { showToast('Tous les champs sont requis', 'err'); return false; }
    if (password.length < 8) { showToast('Mot de passe trop court (8 min)', 'err'); return false; }

    const { data, error } = await supabase.auth.signUp({
      email: e, password,
      options: { data: { name: `${firstName.trim()} ${lastName.trim()}` } },
    });

    if (error) {
      // Affiche l'erreur exacte de Supabase pour diagnostiquer
      showToast(error.message, 'err');
      return false;
    }

    // Supabase retourne un user avec identities vide si l'email est déjà pris
    if (data?.user && data.user.identities?.length === 0) {
      showToast('Cet email est déjà utilisé', 'err');
      return false;
    }

    setPendingEmail(e);
    showToast('Code envoyé ! Vérifiez votre email.', 'ok');
    return true;
  }

  async function verifyOtp(email, token) {
    const { data: d1, error: e1 } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });

    let session = d1?.session ?? null;
    if (!session) {
      const { data: d2 } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (!d2?.session) {
        showToast('Code incorrect ou expiré', 'err');
        return false;
      }
      session = d2.session;
    }

    setPendingEmail(null);
    showToast('Email confirmé ! Bienvenue sur OperaMind.', 'ok');

    const uid = session?.user?.id;
    if (uid) await fetchProfile(uid);

    return true;
  }

  async function resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) { showToast('Erreur lors du renvoi : ' + error.message, 'err'); return false; }
    showToast('Nouveau code envoyé !', 'ok');
    return true;
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null); setImpersonating(null); setCache({}); setPage('operations');
  }

  async function changePassword(oldPass, newPass) {
    const { error: chkErr } = await supabase.auth.signInWithPassword({ email: profile.email, password: oldPass });
    if (chkErr) { showToast('Ancien mot de passe incorrect', 'err'); return false; }
    if (newPass.length < 8) { showToast('8 caractères minimum', 'err'); return false; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { showToast('Erreur : ' + error.message, 'err'); return false; }
    showToast('Mot de passe mis à jour', 'ok'); return true;
  }

  async function loadAllProfiles() {
    if (!profile?.is_admin) return;
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { showToast('Erreur chargement utilisateurs', 'err'); return; }
    setAllProfiles(data || []);
  }

  async function adminTogglePlan(uid) {
    if (!isAdmin) { showToast('Action non autorisée', 'err'); return; }
    const u = allProfiles.find(x => x.id === uid);
    if (!u) return;
    const { error } = await supabase.from('profiles').update({ plan: u.plan === 'pro' ? 'free' : 'pro' }).eq('id', uid);
    if (error) { showToast('Erreur : ' + error.message, 'err'); return; }
    await loadAllProfiles(); showToast('Plan mis à jour', 'ok');
  }

  async function adminToggleBlock(uid) {
    if (!isAdmin) { showToast('Action non autorisée', 'err'); return; }
    const u = allProfiles.find(x => x.id === uid);
    if (!u || u.is_admin) return;
    const ns = u.status === 'active' ? 'blocked' : 'active';
    const { error } = await supabase.from('profiles').update({ status: ns }).eq('id', uid);
    if (error) { showToast('Erreur : ' + error.message, 'err'); return; }
    await loadAllProfiles(); showToast(`Compte ${ns === 'active' ? 'débloqué' : 'bloqué'}`, 'ok');
  }

  async function adminDeleteUser(uid) {
    if (!isAdmin) { showToast('Action non autorisée', 'err'); return; }
    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: uid },
    });
    if (error) {
      const { error: profileErr } = await supabase.from('profiles').delete().eq('id', uid);
      if (profileErr) { showToast('Erreur suppression : ' + profileErr.message, 'err'); return; }
      showToast('Profil supprimé (déployez l\'Edge Function delete-user pour suppression complète)', 'ok');
    } else {
      showToast('Utilisateur supprimé définitivement', 'ok');
    }
    await loadAllProfiles();
  }

  function startImpersonate(u) {
    if (!isAdmin) { showToast('Action impossible', 'err'); return; }
    if (u.is_admin) { showToast('Action impossible', 'err'); return; }
    setImpersonating(u); setPage('operations');
    invalidate(u.id);
    showToast(`Vous visualisez le compte de ${u.name}`, 'ok');
  }

  function stopImpersonate() { setImpersonating(null); setPage('admin'); }

  const FEDAPAY_MONTHLY_LINK = import.meta.env.VITE_FEDAPAY_MONTHLY_LINK || 'https://me.fedapay.com/operamind-pro-mensuel';
  const FEDAPAY_ANNUAL_LINK  = import.meta.env.VITE_FEDAPAY_ANNUAL_LINK  || 'https://me.fedapay.com/operamind-pro-annuel';

  function doUpgrade(plan = 'monthly') {
    const url = plan === 'annual' ? FEDAPAY_ANNUAL_LINK : FEDAPAY_MONTHLY_LINK;
    window.open(url, '_blank', 'noopener');
    setModal(null);
  }

  function showToast(msg, type = 'ok') {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }

  function patchUD(patch) {
    if (!activeId) return;
    const d = getUD();
    if (patch.orders   !== undefined) patch.orders.forEach(o => { if (!d.orders.find(x => x.id === o.id)) addOrder(o); });
    if (patch.products !== undefined) patch.products.forEach(p => { if (!d.products.find(x => x.id === p.id)) addProduct(p); });
    if (patch.costs    !== undefined) patch.costs.forEach(c => { if (!d.costs.find(x => x.id === c.id)) addCost(c); });
    if (patch.tickets  !== undefined) patch.tickets.forEach(t => { if (!d.tickets.find(x => x.id === t.id)) addTicket(t); });
    if (patch.revenues !== undefined) patch.revenues.forEach(r => { if (!d.revenues.find(x => x._id === r._id)) addRevenue(r.amount, r.date); });
    if (patch.goals    !== undefined && patch.goals) setGoal(patch.goals.revenueTarget, patch.goals.month);
  }

  return (
    <Ctx.Provider value={{
      profile, allProfiles, impersonating,
      activeUser: activeProfile, activeProfile, activeId,
      isAdmin, isPro, loading,
      getUD, patchUD, refreshUD,
      addOrder, deleteOrder, updateOrderStatus,
      addProduct, deleteProduct, updateProductStock,
      addRevenue, deleteRevenue,
      addCost, deleteCost,
      addTicket, updateTicketStatus, deleteTicket,
      setGoal,
      loadAllProfiles, adminTogglePlan, adminToggleBlock, adminDeleteUser,
      startImpersonate, stopImpersonate,
      page, setPage, modal, setModal, toast, showToast,
      login, register, logout, changePassword, doUpgrade,
      pendingEmail, setPendingEmail, verifyOtp, resendOtp,
      users: allProfiles,
      currentUser: profile,
      userData: {},
      togglePlan: adminTogglePlan,
      toggleBlock: adminToggleBlock,
      deleteUser: adminDeleteUser,
    }}>
      {children}
    </Ctx.Provider>
  );
}