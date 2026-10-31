import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, BarChart3, Box, CheckCircle2, ChevronDown, CircleHelp, Heart, Leaf, Lightbulb, Menu, Package, PiggyBank, Plus, RotateCcw, Search, ShieldCheck, Sparkles, TrendingUp, Users, Wallet, X } from 'lucide-react'
import './App.css'

type Sale = { id: number; item: string; amount: number; date: string }
type Product = { id: number; name: string; price: number; stock: number }
type View = 'auth' | 'home' | 'app'
type Tab = 'overview' | 'sales' | 'inventory' | 'savings' | 'opportunities'
const initialProducts: Product[] = [
  { id: 1, name: 'Handmade bracelets', price: 50, stock: 12 },
  { id: 2, name: 'Hair accessories', price: 35, stock: 4 },
  { id: 3, name: 'Natural soap', price: 45, stock: 9 },
  { id: 4, name: 'Beaded earrings', price: 65, stock: 3 },
]
const money = (value: number) => `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
function load<T,>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}

export default function App() {
  const [view, setView] = useState<View>('auth')
  const [tab, setTab] = useState<Tab>('overview')
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [demoUser, setDemoUser] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sales, setSales] = useState<Sale[]>(() => load('bloomledger_sales_v1', []))
  const [products, setProducts] = useState<Product[]>(() => load('bloomledger_products_v1', initialProducts))
  const [goal, setGoal] = useState(() => load('bloomledger_goal_v1', 3000))
  const [saved, setSaved] = useState(() => load('bloomledger_saved_v1', 0))
  const [selectedProduct, setSelectedProduct] = useState(1)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('')
  const [toast, setToast] = useState('')
  const revenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.amount, 0), [sales])
  const lowStock = products.filter(p => p.stock <= 5)
  const progress = goal > 0 ? Math.min(100, saved / goal * 100) : 0
  useEffect(() => { localStorage.setItem('bloomledger_sales_v1', JSON.stringify(sales)) }, [sales])
  useEffect(() => { localStorage.setItem('bloomledger_products_v1', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('bloomledger_goal_v1', JSON.stringify(goal)) }, [goal])
  useEffect(() => { localStorage.setItem('bloomledger_saved_v1', JSON.stringify(saved)) }, [saved])
  function notice(message: string) { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  function recordSale(productId = selectedProduct) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    if (product.stock <= 0) { notice('Out of stock — restock before recording a sale.'); return }
    setProducts(current => current.map(p => p.id === productId ? { ...p, stock: p.stock - 1 } : p))
    setSales(current => [{ id: Date.now(), item: product.name, amount: product.price, date: new Date().toLocaleString('en-ZA') }, ...current])
    notice(`${product.name} sale recorded — ${money(product.price)}`)
  }
  function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(newPrice), stock = Number(newStock)
    if (!newName.trim() || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) { notice('Enter a valid name, price and stock quantity.'); return }
    const product = { id: Date.now(), name: newName.trim(), price, stock }
    setProducts(current => [...current, product]); setSelectedProduct(product.id)
    setNewName(''); setNewPrice(''); setNewStock(''); notice('Product added successfully!')
  }
  function openApp(nextTab: Tab = 'overview') { setTab(nextTab); setView('app'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function signOut() { setDemoUser(''); setAuthPassword(''); setView('auth'); setMobileMenu(false) }
  function enterDemo() { setDemoUser(authName.trim() || authEmail.split('@')[0] || 'Entrepreneur'); setAuthPassword(''); openApp() }
  function backHome() { setView('home'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const selected = products.find(p => p.id === selectedProduct)
  return <div className="site">
    {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    {view === 'auth' ? <main className="auth-layout">
      <section className="auth-story">
        <div className="auth-story-inner">
          <div className="auth-logo"><span className="brand-flower">✿</span> Bloom<span>Ledger</span></div>
          <div className="auth-bloom">✿ <span>♡</span> ✿</div>
          <div className="auth-kicker">BUILT FOR HER • MADE TO GROW</div>
          <h1>Her hustle.<br/><em>Her future.</em><br/>Her bloom.</h1>
          <p>Every sale tells a story. Record your progress, build better habits, and grow towards the business you dream of.</p>
          <div className="auth-steps"><span>✦ Earn</span><span>♡ Save</span><span>✿ Own</span></div>
          <div className="auth-story-note">Small steps. Brighter futures. 🌸</div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">✿ Bloom<span>Ledger</span></div>
          <div className="auth-pill">✿ YOUR SPACE TO BLOOM</div>
          <h2>{authMode === 'login' ? 'Welcome back! 🌸' : authMode === 'signup' ? 'Start your journey ✨' : 'Password help'}</h2>
          <p className="auth-subtitle">{authMode === 'login' ? 'Your business, your dreams, your next big step.' : authMode === 'signup' ? 'Create your BloomLedger demo profile.' : 'Password recovery will be available when secure accounts are connected.'}</p>
          {authMode !== 'reset' ? <form onSubmit={e => { e.preventDefault(); enterDemo() }} className="auth-form">
            {authMode === 'signup' && <label>Your name<input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="e.g. Nomsa" required autoComplete="name" /></label>}
            <label>Email address<input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Enter a demo password" required minLength={4} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} /></label>
            <div className="auth-help"><span>Hackathon demo mode</span><button type="button" onClick={() => setAuthMode('reset')}>Forgot password?</button></div>
            <button className="primary auth-submit" type="submit">{authMode === 'signup' ? 'Create demo profile' : 'Enter my workspace'} <ArrowRight size={18}/></button>
          </form> : <div className="auth-reset"><p>No password reset email can be sent in this prototype. Choose Try Demo to explore safely.</p><button className="primary auth-submit" onClick={() => setAuthMode('login')}>Back to sign in <ArrowRight size={17}/></button></div>}
          <div className="auth-divider"><span>or explore without an account</span></div>
          <button className="auth-demo" onClick={enterDemo}>✦ Try Demo Workspace <ArrowUpRight size={18}/></button>
          <p className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to BloomLedger?'} <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>{authMode === 'signup' ? 'Sign in' : 'Create account'}</button></p>
          <button className="auth-explore" onClick={backHome}>Explore our website →</button>
          <p className="auth-disclaimer">Prototype only: sign-in is simulated. No password is saved or verified, and business data remains in this browser. Do not enter a real password.</p>
        </div>
      </section>
    </main> : view === 'home' ? <>
      <header className="topbar wrap">
        <button className="brand" onClick={backHome} aria-label="BloomLedger home"><span className="brand-flower">✿</span><span>Bloom<span className="brand-green">Ledger</span><small>Small Steps. Brighter Futures.</small></span></button>
        <nav className={`navlinks ${mobileMenu ? 'open' : ''}`} aria-label="Main navigation"><a href="#home" onClick={() => setMobileMenu(false)}>Home</a><a href="#features" onClick={() => setMobileMenu(false)}>Features</a><a href="#how" onClick={() => setMobileMenu(false)}>How It Works</a><a href="#impact" onClick={() => setMobileMenu(false)}>Impact</a></nav>
        <button className="primary top-action" onClick={() => openApp()}>Launch App <ArrowRight size={18} /></button>
        <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
      </header>
      <main>
        <section className="hero wrap" id="home">
          <div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> For women. Real businesses. Bigger dreams.</div><h1>Turn everyday sales into <span>brighter futures.</span></h1><p>BloomLedger helps women entrepreneurs track sales, manage inventory, save for big goals, and discover new opportunities — all in one beautiful, practical platform.</p><div className="hero-actions"><button className="primary" onClick={() => openApp()}>Launch App <ArrowRight size={19} /></button><a className="secondary" href="#bloombox"><span className="play">▶</span> Try BloomBox demo</a></div><div className="hero-notes"><span><CheckCircle2 size={16} /> Built for women</span><span><CheckCircle2 size={16} /> Simple to use</span><span><CheckCircle2 size={16} /> Offline-first vision</span></div></div>
          <div className="hero-art"><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-flower flower-one">✿</div><div className="art-flower flower-two">✿</div><div className="art-scribble">Small business.<br/><strong>BIG dreams.</strong> ♡</div><div className="mock-dashboard"><div className="mock-head"><span className="avatar">✿</span><div><strong>Good morning, entrepreneur! 👋</strong><small>Your hustle is building brighter futures.</small></div></div><div className="mock-grid"><div className="mock-tile big"><small>Total recorded sales</small><strong>{money(revenue)}</strong><div className="sparkline"><svg viewBox="0 0 240 70" preserveAspectRatio="none"><path d="M0 56 C22 40 28 54 46 38 S75 50 94 28 S123 36 140 22 S170 38 189 14 S220 24 240 5" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" /></svg></div></div><div className="mock-tile"><small>OwnPath savings</small><strong>{money(saved)}</strong><div className="meter"><span style={{ width: `${progress}%` }} /></div><small>{progress.toFixed(0)}% of your goal</small></div><div className="mock-tile"><Package size={20}/><strong>{products.length}</strong><small>Products</small></div><div className="mock-tile"><TrendingUp size={20}/><strong>{sales.length}</strong><small>Transactions</small></div><div className="mock-tile"><Heart size={20}/><strong>{lowStock.length}</strong><small>Low stock alerts</small></div></div><button className="mock-launch" onClick={() => openApp()}>Open my dashboard <ArrowUpRight size={17}/></button></div><div className="bloombox-illustration"><div className="bloom-top">✿ BLOOMBOX <span className="status-light"/></div><div className="bloom-screen">SALE READY <strong>{money(revenue)}</strong><small>{sales.length} sales recorded</small></div><button onClick={() => recordSale()} title="Record a sale using the selected product">+ SALE</button><small>SIMULATED DEVICE</small></div></div>
        </section>
        <div className="ribbon"><span>✿ Every sale matters</span><span>♡ Every dream counts</span><span>✦ Every woman deserves to grow</span></div>
        <section className="section wrap" id="features"><div className="section-intro"><div><div className="section-label">WHAT BLOOMLEDGER DOES</div><h2>Everything she needs<br/><em>to grow.</em></h2></div><p>One friendly place to turn daily business activity into clearer decisions and a stronger future.</p></div><div className="feature-grid"><button className="feature pink" onClick={() => openApp('sales')}><span className="feature-icon"><BarChart3 /></span><h3>Sales Tracking</h3><p>Record every sale and see how your business is growing.</p><ArrowUpRight className="feature-arrow" /></button><button className="feature mint" onClick={() => openApp('inventory')}><span className="feature-icon"><Box /></span><h3>Inventory Management</h3><p>Know what's in stock and spot what needs restocking.</p><ArrowUpRight className="feature-arrow" /></button><button className="feature lilac" onClick={() => openApp('savings')}><span className="feature-icon"><PiggyBank /></span><h3>OwnPath Savings</h3><p>Set meaningful goals and work towards business assets.</p><ArrowUpRight className="feature-arrow" /></button><button className="feature peach" onClick={() => openApp('opportunities')}><span className="feature-icon"><Lightbulb /></span><h3>Opportunity Engine</h3><p>Explore ideas for finding customers and growing income.</p><ArrowUpRight className="feature-arrow" /></button></div></section>
        <section className="story-section" id="how"><div className="wrap story-grid"><div><div className="section-label">THE BLOOM JOURNEY</div><h2>She earns.<br/>She saves.<br/><em>She owns.</em></h2><p>It's not just about tracking money. It's about helping women see the value of their work and plan their next big move.</p><button className="primary" onClick={() => openApp('savings')}>Start an OwnPath goal <ArrowRight size={18}/></button></div><div className="journey"><div><span>01</span><div><h3>Earn</h3><p>Record sales and build a clear picture of your business.</p></div><TrendingUp /></div><div><span>02</span><div><h3>Save</h3><p>Choose a goal and track the savings you set aside.</p></div><Wallet /></div><div><span>03</span><div><h3>Own</h3><p>Work towards equipment and tools that support growth.</p></div><Sparkles /></div></div></div></section>
        <section className="section wrap bloombox-section" id="bloombox"><div><div className="section-label">MEET BLOOMBOX</div><h2>Small button.<br/><em>Big possibilities.</em></h2><p>Our Arduino Uno companion is designed to help traders record sales without needing a smartphone at the point of sale. Try the software simulation below.</p><div className="info-chip"><ShieldCheck size={17}/> Hardware integration is in development</div></div><div className="demo-card"><div className="demo-card-header"><span><span className="live-dot"/> INTERACTIVE DEMO</span><span>NOT PHYSICAL HARDWARE</span></div><h3>Make a sale bloom ✿</h3><label htmlFor="productSelect">Choose a product</label><div className="select-wrap"><select id="productSelect" value={selectedProduct} onChange={e => setSelectedProduct(Number(e.target.value))}>{products.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.price)} ({p.stock} left)</option>)}</select><ChevronDown size={18}/></div><button className="sale-demo-button" onClick={() => recordSale()} disabled={!selected || selected.stock <= 0}><Plus size={23}/> Record sale {selected ? `· ${money(selected.price)}` : ''}</button><div className="demo-results"><div><small>Recorded sales</small><strong>{sales.length}</strong></div><div><small>Total revenue</small><strong>{money(revenue)}</strong></div></div><p className="disclaimer">Demo records are entered manually and stored in this browser. They are not independently verified transactions or real bank deposits.</p></div></section>
        <section className="closing" id="impact"><div className="wrap"><div className="closing-flower">✿</div><div className="section-label">BUILT FOR HER</div><h2>When she grows,<br/><em>her community blooms.</em></h2><p>More than a tool. A partner in her journey towards financial independence.</p><button className="primary" onClick={() => openApp()}>Explore BloomLedger <ArrowRight size={19}/></button></div></section>
      </main><footer className="footer wrap"><span className="footer-brand">✿ BloomLedger</span><span>Made for SheCode Hackathon 2026 · Prototype</span><span>Small steps. Brighter futures. ♡</span></footer>
    </> : <div className="app-shell"><aside className={`sidebar ${mobileMenu ? 'open' : ''}`}><button className="brand app-brand" onClick={backHome}><span className="brand-flower">✿</span><span>Bloom<span className="brand-green">Ledger</span></span></button><div className="sidebar-label">MY BUSINESS</div>{([['overview','Overview',BarChart3],['sales','Sales',TrendingUp],['inventory','Inventory',Package],['savings','OwnPath Savings',PiggyBank],['opportunities','Opportunities',Lightbulb]] as const).map(([key,label,Icon]) => <button key={key} className={`sidebar-item ${tab === key ? 'active' : ''}`} onClick={() => { setTab(key); setMobileMenu(false) }}><Icon size={19}/>{label}</button>)}<div className="sidebar-bottom"><div>✿ Your business deserves to bloom.</div><button onClick={backHome}>← Back to website</button><button onClick={signOut}>↪ Sign out</button></div></aside><div className="app-main"><div className="app-top"><button className="menu-button app-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle app menu"><Menu/></button><span>BloomLedger / {tab === 'savings' ? 'OwnPath Savings' : tab[0].toUpperCase()+tab.slice(1)}</span><span className="demo-badge">{demoUser ? `${demoUser} · DEMO` : "DEMO WORKSPACE"}</span></div><div className="app-content"><div className="app-heading"><div><div className="section-label">YOUR BUSINESS, YOUR FUTURE</div><h1>{tab === 'overview' ? 'Welcome back! ✿' : tab === 'sales' ? 'Sales tracking' : tab === 'inventory' ? 'Your inventory' : tab === 'savings' ? 'OwnPath savings' : 'Opportunity Engine'}</h1><p>{tab === 'overview' ? 'Here is how your business is blooming today.' : tab === 'sales' ? 'Every sale is a step forward.' : tab === 'inventory' ? 'Keep track of your products and stock.' : tab === 'savings' ? 'Small savings can lead to big milestones.' : 'Ideas and pathways to help your business grow.'}</p></div></div>
      {(tab === 'overview' || tab === 'sales') && <div className="stat-grid"><div className="stat-card"><span>Total revenue <Wallet size={19}/></span><strong>{money(revenue)}</strong><small>Recorded in this demo</small></div><div className="stat-card"><span>Transactions <TrendingUp size={19}/></span><strong>{sales.length}</strong><small>Sales entered</small></div><div className="stat-card"><span>Products <Package size={19}/></span><strong>{products.length}</strong><small>{lowStock.length} low-stock alerts</small></div><div className="stat-card"><span>Saved towards goal <PiggyBank size={19}/></span><strong>{money(saved)}</strong><small>{progress.toFixed(0)}% of goal</small></div></div>}
      {(tab === 'overview' || tab === 'sales') && <div className="panel-grid"><section className="panel"><div className="panel-title"><h2>Record a sale</h2><span className="pill">QUICK ACTION</span></div><label htmlFor="appProduct">Select a product</label><div className="select-wrap"><select id="appProduct" value={selectedProduct} onChange={e => setSelectedProduct(Number(e.target.value))}>{products.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.price)} ({p.stock} left)</option>)}</select><ChevronDown size={18}/></div><button className="primary full" onClick={() => recordSale()} disabled={!selected || selected.stock <= 0}><Plus size={18}/> Record sale</button><p className="fineprint">Recording a sale reduces available inventory by one.</p></section><section className="panel"><div className="panel-title"><h2>Recent sales</h2><span className="pill">{sales.length} TOTAL</span></div>{sales.length === 0 ? <div className="empty"><BarChart3 size={34}/><p>No sales yet. Record your first one!</p></div> : <div className="sale-list">{sales.slice(0,6).map(s => <div key={s.id}><span><strong>{s.item}</strong><small>{s.date}</small></span><b>{money(s.amount)}</b></div>)}</div>}</section></div>}
      {tab === 'inventory' && <div className="panel-grid"><section className="panel"><div className="panel-title"><h2>Your products</h2><span className="pill">{products.length} ITEMS</span></div><div className="inventory-list">{products.map(p => <div key={p.id}><div><strong>{p.name}</strong><small>{money(p.price)} each</small></div><div className="inventory-controls"><span className={p.stock <= 5 ? 'stock-low' : 'stock-ok'}>{p.stock} left</span><button aria-label={`Add stock to ${p.name}`} onClick={() => setProducts(items => items.map(i => i.id === p.id ? {...i,stock:i.stock+1} : i))}><Plus size={16}/></button></div></div>)}</div></section><section className="panel"><h2>Add a product</h2><form onSubmit={addProduct} className="product-form"><label>Product name<input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Handmade tote bag" required /></label><label>Price (R)<input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" min="0.01" step="0.01" required /></label><label>Starting stock<input value={newStock} onChange={e => setNewStock(e.target.value)} type="number" min="0" step="1" required /></label><button className="primary full" type="submit"><Plus size={18}/> Add product</button></form></section></div>}
      {tab === 'savings' && <div className="panel-grid"><section className="panel savings-panel"><span className="section-label">MY OWNPATH GOAL</span><h2>My business equipment fund ✨</h2><div className="savings-big">{money(saved)} <small>of {money(goal)}</small></div><div className="meter big-meter"><span style={{width:`${progress}%`}}/></div><p>{progress.toFixed(1)}% complete · {money(Math.max(0,goal-saved))} to go</p><div className="savings-actions"><button onClick={() => setSaved(v => v + 20)}>Save R20</button><button onClick={() => setSaved(v => v + 50)}>Save R50</button><button onClick={() => setSaved(v => v + 100)}>Save R100</button></div><p className="fineprint">Savings are simulated amounts you manually mark as set aside, not money transferred to a bank.</p></section><section className="panel"><h2>Set your goal</h2><label htmlFor="goalAmount">Target amount (R)</label><input id="goalAmount" type="number" min="1" step="1" value={goal} onChange={e => setGoal(Math.max(1,Number(e.target.value)||1))}/><div className="tip"><Heart size={20}/><span>Every small contribution is a step closer to owning something meaningful for your business.</span></div></section></div>}
      {tab === 'opportunities' && <div className="opportunity-grid"><div className="opportunity-card"><span className="opportunity-icon">🛍️</span><h2>Find more customers</h2><p>Share your product catalogue with nearby community groups and local markets.</p><span className="pill">GROW YOUR REACH</span></div><div className="opportunity-card"><span className="opportunity-icon">📦</span><h2>Plan your next restock</h2><p>Use your low-stock alerts and sales history to decide what to buy next.</p><span className="pill">SMARTER INVENTORY</span></div><div className="opportunity-card"><span className="opportunity-icon">🌱</span><h2>Grow an asset fund</h2><p>Set a goal for a tool or piece of equipment that can help increase income.</p><button className="inline-link" onClick={() => setTab('savings')}>Open OwnPath <ArrowRight size={16}/></button></div><div className="opportunity-card"><span className="opportunity-icon">🤝</span><h2>Community connections</h2><p>Explore collaborations with other women entrepreneurs. Verified external matches are planned for a future release.</p><span className="pill">COMING LATER</span></div></div>}
      <div className="app-disclaimer"><CircleHelp size={17}/> Prototype data is stored locally in this browser. No financial institution or real Arduino device is connected yet. Business records entered here are self-reported.</div>
    </div></div></div>}
  </div>
}
