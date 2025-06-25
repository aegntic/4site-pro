# 4site.pro Ultra-Detailed Production Tasks

## 🚀 IMMEDIATE EXECUTION ROADMAP
**Total Estimated Time**: 12.5 hours  
**Total Estimated Tokens**: ~45,000 tokens  
**Target**: Working production system with paying users  

---

## ⚡ CRITICAL PATH TASKS (Next 4 Hours)

### TASK 1: Fix URL Auto-completion Bug
**Priority**: CRITICAL  
**Time Estimate**: 45 minutes  
**Token Estimate**: 800 tokens  
**Assignee**: Immediate execution  

**Problem**: Users entering "aegntic/DAILYDOCO" don't see URL expansion

**Implementation Steps**:
1. **Debug React State (15 min, 200 tokens)**:
   ```typescript
   // Add comprehensive logging to URLInputForm.tsx
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     console.log('1. Input value:', value);
     setRepoUrl(value);
     console.log('2. State after setValue:', repoUrl);
     
     // Add immediate visual preview
     if (value.match(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)) {
       const expandedUrl = `https://github.com/${value}`;
       console.log('3. Expanded URL:', expandedUrl);
       setPreviewUrl(expandedUrl);
     }
   };
   ```

2. **Implement Real-time Preview (20 min, 400 tokens)**:
   ```typescript
   // Add preview state and visual feedback
   const [previewUrl, setPreviewUrl] = useState('');
   const [showPreview, setShowPreview] = useState(false);
   
   // Visual preview component below input
   {showPreview && previewUrl && (
     <div className="glass-card mt-2 p-2">
       <span className="text-wu-gold-muted text-sm">
         Will generate: {previewUrl}
       </span>
     </div>
   )}
   ```

3. **Test & Deploy (10 min, 200 tokens)**:
   - Test with: "aegntic/DAILYDOCO", "facebook/react", "microsoft/vscode"
   - Deploy to production
   - Validate with real user testing

**Acceptance Criteria**:
- ✅ User types "aegntic/DAILYDOCO" → sees "https://github.com/aegntic/DAILYDOCO" preview
- ✅ Visual feedback appears immediately (< 100ms)
- ✅ Deployed and tested in production
- ✅ No regression in existing URL handling

---

### TASK 2: Supabase Authentication Implementation
**Priority**: CRITICAL  
**Time Estimate**: 2 hours  
**Token Estimate**: 3,200 tokens  
**Assignee**: Immediate execution  

**Goal**: Working email/password authentication with user persistence

**Implementation Steps**:

1. **Supabase Project Setup (30 min, 600 tokens)**:
   ```bash
   # Create Supabase project
   npx supabase init
   npx supabase start
   
   # Install dependencies
   npm install @supabase/supabase-js @supabase/auth-ui-react
   ```
   
   ```typescript
   // supabase.ts
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

2. **User Schema & Database Setup (20 min, 400 tokens)**:
   ```sql
   -- User profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
     generations_used INTEGER DEFAULT 0,
     generations_limit INTEGER DEFAULT 3,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );
   
   -- Generation history
   CREATE TABLE generations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     repository_url TEXT NOT NULL,
     generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     site_data JSONB,
     generation_time_ms INTEGER
   );
   
   -- Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   ```

3. **React Auth Context (45 min, 1000 tokens)**:
   ```typescript
   // contexts/AuthContext.tsx
   interface AuthContextType {
     user: User | null;
     profile: Profile | null;
     signUp: (email: string, password: string, fullName: string) => Promise<void>;
     signIn: (email: string, password: string) => Promise<void>;
     signOut: () => Promise<void>;
     loading: boolean;
     canGenerate: boolean;
   }
   
   export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [user, setUser] = useState<User | null>(null);
     const [profile, setProfile] = useState<Profile | null>(null);
     const [loading, setLoading] = useState(true);
   
     // Auth state management
     useEffect(() => {
       supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null);
         if (session?.user) fetchProfile(session.user.id);
         setLoading(false);
       });
   
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (event, session) => {
           setUser(session?.user ?? null);
           if (session?.user) {
             await fetchProfile(session.user.id);
           } else {
             setProfile(null);
           }
           setLoading(false);
         }
       );
   
       return () => subscription.unsubscribe();
     }, []);
   
     const canGenerate = useMemo(() => {
       if (!user) return true; // Anonymous users get 3 free
       return profile ? profile.generations_used < profile.generations_limit : false;
     }, [user, profile]);
   
     return (
       <AuthContext.Provider value={{
         user, profile, signUp, signIn, signOut, loading, canGenerate
       }}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

4. **Sign-up/Sign-in UI Components (25 min, 800 tokens)**:
   ```typescript
   // components/auth/AuthModal.tsx
   export const AuthModal: React.FC<{
     isOpen: boolean;
     onClose: () => void;
     mode: 'signin' | 'signup';
   }> = ({ isOpen, onClose, mode }) => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [fullName, setFullName] = useState('');
     const [loading, setLoading] = useState(false);
     const { signUp, signIn } = useAuth();
   
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       try {
         if (mode === 'signup') {
           await signUp(email, password, fullName);
         } else {
           await signIn(email, password);
         }
         onClose();
       } catch (error) {
         console.error('Auth error:', error);
       } finally {
         setLoading(false);
       }
     };
   
     return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="glass-container max-w-md w-full p-6">
           <h2 className="text-xl font-bold mb-4">
             {mode === 'signup' ? 'Create Account' : 'Sign In'}
           </h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             {mode === 'signup' && (
               <input
                 type="text"
                 placeholder="Full Name"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="input w-full"
                 required
               />
             )}
             <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="input w-full"
               required
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="input w-full"
               required
             />
             <button type="submit" className="btn-primary w-full" disabled={loading}>
               {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
             </button>
           </form>
         </div>
       </div>
     );
   };
   ```

**Acceptance Criteria**:
- ✅ Users can sign up with email/password
- ✅ Users can sign in/out
- ✅ User state persists across browser refresh
- ✅ Profile data stored in Supabase
- ✅ Generation limits enforced
- ✅ Deployed and tested

---

### TASK 3: Conversion Trigger Implementation
**Priority**: HIGH  
**Time Estimate**: 1 hour  
**Token Estimate**: 1,500 tokens  
**Assignee**: Immediate execution  

**Goal**: Show sign-up prompt after 3 demo generations

**Implementation Steps**:

1. **Anonymous User Tracking (20 min, 400 tokens)**:
   ```typescript
   // hooks/useGenerationTracking.ts
   export const useGenerationTracking = () => {
     const [anonymousGenerations, setAnonymousGenerations] = useState(0);
     const [showSignupPrompt, setShowSignupPrompt] = useState(false);
     const { user } = useAuth();
   
     useEffect(() => {
       const stored = localStorage.getItem('anonymous_generations');
       setAnonymousGenerations(stored ? parseInt(stored) : 0);
     }, []);
   
     const trackGeneration = useCallback(() => {
       if (!user) {
         const newCount = anonymousGenerations + 1;
         setAnonymousGenerations(newCount);
         localStorage.setItem('anonymous_generations', newCount.toString());
         
         if (newCount >= 3) {
           setShowSignupPrompt(true);
         }
       }
     }, [user, anonymousGenerations]);
   
     const resetAnonymousTracking = useCallback(() => {
       setAnonymousGenerations(0);
       localStorage.removeItem('anonymous_generations');
       setShowSignupPrompt(false);
     }, []);
   
     return {
       anonymousGenerations,
       showSignupPrompt,
       setShowSignupPrompt,
       trackGeneration,
       resetAnonymousTracking
     };
   };
   ```

2. **Conversion UI Component (25 min, 600 tokens)**:
   ```typescript
   // components/ConversionPrompt.tsx
   export const ConversionPrompt: React.FC<{
     isOpen: boolean;
     onClose: () => void;
     onSignUp: () => void;
   }> = ({ isOpen, onClose, onSignUp }) => {
     if (!isOpen) return null;
   
     return (
       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
         <div className="glass-container max-w-lg w-full p-8 text-center">
           <div className="mb-6">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-2xl font-bold mb-2">You've Generated 3 Amazing Sites!</h2>
             <p className="text-wu-gold-muted">
               Join thousands of developers who trust 4site.pro for their project sites
             </p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
             <div className="glass-card p-3">
               <div className="font-semibold">Free Account</div>
               <div>25 generations/month</div>
               <div>Basic templates</div>
               <div>Download sites</div>
             </div>
             <div className="glass-card p-3 border-wu-gold">
               <div className="font-semibold text-wu-gold">Pro Account</div>
               <div>Unlimited generations</div>
               <div>Premium templates</div>
               <div>Custom domains</div>
               <div>Priority support</div>
             </div>
           </div>
           
           <div className="flex gap-3">
             <button onClick={onSignUp} className="btn-primary flex-1">
               Create Free Account
             </button>
             <button onClick={onClose} className="btn-secondary">
               Continue as Guest
             </button>
           </div>
           
           <p className="text-xs text-wu-gold-muted mt-4">
             No credit card required • Upgrade anytime
           </p>
         </div>
       </div>
     );
   };
   ```

3. **Integration with Site Generation (15 min, 500 tokens)**:
   ```typescript
   // Update App.tsx to include conversion tracking
   const App = () => {
     const {
       anonymousGenerations,
       showSignupPrompt,
       setShowSignupPrompt,
       trackGeneration,
       resetAnonymousTracking
     } = useGenerationTracking();
   
     const [showAuthModal, setShowAuthModal] = useState(false);
     const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
   
     const handleGenerationComplete = useCallback((siteData: SiteData) => {
       setSiteData(siteData);
       setIsLoading(false);
       trackGeneration(); // Track after successful generation
     }, [trackGeneration]);
   
     const handleSignUpFromPrompt = () => {
       setShowSignupPrompt(false);
       setAuthMode('signup');
       setShowAuthModal(true);
     };
   
     // Reset tracking when user signs up
     const { user } = useAuth();
     useEffect(() => {
       if (user) {
         resetAnonymousTracking();
       }
     }, [user, resetAnonymousTracking]);
   
     return (
       <>
         {/* Existing app content */}
         <ConversionPrompt
           isOpen={showSignupPrompt}
           onClose={() => setShowSignupPrompt(false)}
           onSignUp={handleSignUpFromPrompt}
         />
         <AuthModal
           isOpen={showAuthModal}
           onClose={() => setShowAuthModal(false)}
           mode={authMode}
         />
       </>
     );
   };
   ```

**Acceptance Criteria**:
- ✅ Anonymous users tracked in localStorage
- ✅ Sign-up prompt appears after 3rd generation
- ✅ Compelling conversion UI with value proposition
- ✅ Users can continue as guest or sign up
- ✅ Tracking resets after sign-up
- ✅ No impact on existing user experience

---

### TASK 4: Production Deployment Pipeline
**Priority**: HIGH  
**Time Estimate**: 30 minutes  
**Token Estimate**: 600 tokens  
**Assignee**: Immediate execution  

**Goal**: Automated deployment with environment management

**Implementation Steps**:

1. **Environment Configuration (10 min, 200 tokens)**:
   ```bash
   # .env.example
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_GITHUB_TOKEN=your_github_token
   ```

2. **GitHub Actions Deployment (15 min, 300 tokens)**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
             VITE_OPENROUTER_API_KEY: ${{ secrets.VITE_OPENROUTER_API_KEY }}
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           if: github.ref == 'refs/heads/main'
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Health Check Endpoint (5 min, 100 tokens)**:
   ```typescript
   // utils/healthCheck.ts
   export const performHealthCheck = async () => {
     const checks = {
       supabase: false,
       openrouter: false,
       github: false
     };
   
     try {
       const { data } = await supabase.from('profiles').select('count').limit(1);
       checks.supabase = true;
     } catch (error) {
       console.error('Supabase health check failed:', error);
     }
   
     return checks;
   };
   ```

**Acceptance Criteria**:
- ✅ Automated deployment on push to main
- ✅ Environment variables properly configured
- ✅ Build process includes all dependencies
- ✅ Health checks validate service connectivity
- ✅ Rollback capability available

---

## 🔧 ENHANCEMENT TASKS (Hours 5-8)

### TASK 5: Advanced Error Handling & User Feedback
**Priority**: HIGH  
**Time Estimate**: 2 hours  
**Token Estimate**: 2,800 tokens  

**Implementation Steps**:

1. **Global Error Boundary (30 min, 600 tokens)**:
   ```typescript
   // components/ErrorBoundary.tsx
   export class ErrorBoundary extends React.Component<
     { children: React.ReactNode },
     { hasError: boolean; error?: Error }
   > {
     constructor(props: any) {
       super(props);
       this.state = { hasError: false };
     }
   
     static getDerivedStateFromError(error: Error) {
       return { hasError: true, error };
     }
   
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       console.error('Application error:', error, errorInfo);
       
       // Send to monitoring service
       if (typeof gtag !== 'undefined') {
         gtag('event', 'exception', {
           description: error.toString(),
           fatal: false
         });
       }
     }
   
     render() {
       if (this.state.hasError) {
         return (
           <div className="min-h-screen flex items-center justify-center">
             <div className="glass-container max-w-md p-6 text-center">
               <div className="text-4xl mb-4">⚠️</div>
               <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
               <p className="text-wu-gold-muted mb-4">
                 We've been notified and are working to fix this issue.
               </p>
               <button 
                 onClick={() => window.location.reload()}
                 className="btn-primary"
               >
                 Reload Page
               </button>
             </div>
           </div>
         );
       }
   
       return this.props.children;
     }
   }
   ```

2. **API Error Handling (45 min, 1000 tokens)**:
   ```typescript
   // utils/errorHandling.ts
   export class APIError extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public context?: any
     ) {
       super(message);
       this.name = 'APIError';
     }
   }
   
   export const handleAPIError = (error: any, context: string) => {
     console.error(`${context} error:`, error);
   
     if (error.code === 'PGRST301') {
       return new APIError('Database connection failed', 503, context);
     }
   
     if (error.message?.includes('rate limit')) {
       return new APIError('Rate limit exceeded', 429, context);
     }
   
     if (error.status === 401) {
       return new APIError('Authentication required', 401, context);
     }
   
     return new APIError('An unexpected error occurred', 500, context);
   };
   
   export const retryWithBackoff = async <T>(
     operation: () => Promise<T>,
     maxRetries: number = 3,
     baseDelay: number = 1000
   ): Promise<T> => {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await operation();
       } catch (error) {
         if (attempt === maxRetries) throw error;
         
         const delay = baseDelay * Math.pow(2, attempt - 1);
         await new Promise(resolve => setTimeout(resolve, delay));
       }
     }
     throw new Error('Max retries exceeded');
   };
   ```

3. **User Notification System (45 min, 1200 tokens)**:
   ```typescript
   // contexts/NotificationContext.tsx
   interface Notification {
     id: string;
     type: 'success' | 'error' | 'warning' | 'info';
     title: string;
     message: string;
     duration?: number;
     action?: {
       label: string;
       onClick: () => void;
     };
   }
   
   export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [notifications, setNotifications] = useState<Notification[]>([]);
   
     const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
       const id = Math.random().toString(36).substr(2, 9);
       const newNotification = { ...notification, id };
       
       setNotifications(prev => [...prev, newNotification]);
   
       if (notification.duration !== 0) {
         setTimeout(() => {
           removeNotification(id);
         }, notification.duration || 5000);
       }
     }, []);
   
     const removeNotification = useCallback((id: string) => {
       setNotifications(prev => prev.filter(n => n.id !== id));
     }, []);
   
     return (
       <NotificationContext.Provider value={{ addNotification, removeNotification }}>
         {children}
         <NotificationContainer notifications={notifications} onRemove={removeNotification} />
       </NotificationContext.Provider>
     );
   };
   ```

**Acceptance Criteria**:
- ✅ Global error boundary catches all React errors
- ✅ API errors properly categorized and handled
- ✅ Retry logic with exponential backoff
- ✅ User-friendly notification system
- ✅ Error tracking and monitoring

---

### TASK 6: Performance Optimization & Caching
**Priority**: MEDIUM  
**Time Estimate**: 2 hours  
**Token Estimate**: 3,000 tokens  

**Implementation Steps**:

1. **Repository Content Caching (45 min, 1000 tokens)**:
   ```typescript
   // utils/cache.ts
   interface CacheEntry<T> {
     data: T;
     timestamp: number;
     expiresAt: number;
   }
   
   class SmartCache<T> {
     private cache = new Map<string, CacheEntry<T>>();
     private defaultTTL: number;
   
     constructor(defaultTTL: number = 60 * 60 * 1000) { // 1 hour
       this.defaultTTL = defaultTTL;
     }
   
     set(key: string, data: T, ttl?: number): void {
       const now = Date.now();
       const entry: CacheEntry<T> = {
         data,
         timestamp: now,
         expiresAt: now + (ttl || this.defaultTTL)
       };
       this.cache.set(key, entry);
     }
   
     get(key: string): T | null {
       const entry = this.cache.get(key);
       if (!entry) return null;
   
       if (Date.now() > entry.expiresAt) {
         this.cache.delete(key);
         return null;
       }
   
       return entry.data;
     }
   
     clear(): void {
       this.cache.clear();
     }
   
     size(): number {
       return this.cache.size;
     }
   }
   
   export const repositoryCache = new SmartCache<any>(60 * 60 * 1000); // 1 hour
   export const aiResponseCache = new SmartCache<any>(24 * 60 * 60 * 1000); // 24 hours
   ```

2. **AI Response Caching (30 min, 700 tokens)**:
   ```typescript
   // services/aiService.ts (updated)
   export const analyzeRepositoryWithCache = async (
     repoUrl: string,
     readmeContent: string
   ): Promise<SiteData> => {
     const cacheKey = `ai_${btoa(repoUrl)}_${btoa(readmeContent.substring(0, 100))}`;
     
     // Check cache first
     const cached = aiResponseCache.get(cacheKey);
     if (cached) {
       console.log('Using cached AI response');
       return cached;
     }
   
     // Generate new response
     const response = await analyzeRepository(readmeContent);
     
     // Cache the response
     aiResponseCache.set(cacheKey, response);
     
     return response;
   };
   ```

3. **Component Performance Optimization (45 min, 1300 tokens)**:
   ```typescript
   // Optimize heavy components with React.memo and useMemo
   
   // components/templates/TechProjectTemplate.tsx
   export const TechProjectTemplate = React.memo<{ siteData: SiteData }>(({ siteData }) => {
     const processedSections = useMemo(() => {
       return siteData.sections.map(section => ({
         ...section,
         processedContent: marked(section.content)
       }));
     }, [siteData.sections]);
   
     const colorScheme = useMemo(() => {
       return generateColorScheme(siteData.primaryColor);
     }, [siteData.primaryColor]);
   
     return (
       <div className="tech-template" style={colorScheme}>
         {processedSections.map(section => (
           <Section key={section.id} section={section} />
         ))}
       </div>
     );
   });
   
   // Lazy load heavy components
   const NeuralBackground = React.lazy(() => import('./ui/NeuralBackground'));
   const SitePreview = React.lazy(() => import('./generator/SitePreview'));
   
   // Use Suspense for lazy components
   <Suspense fallback={<div className="loading-spinner" />}>
     <NeuralBackground />
   </Suspense>
   ```

**Acceptance Criteria**:
- ✅ Repository content cached for 1 hour
- ✅ AI responses cached for 24 hours
- ✅ Heavy components optimized with React.memo
- ✅ Lazy loading implemented for non-critical components
- ✅ Performance metrics tracked

---

## 💰 MONETIZATION TASKS (Hours 9-12)

### TASK 7: Stripe Payment Integration
**Priority**: HIGH  
**Time Estimate**: 3 hours  
**Token Estimate**: 4,500 tokens  

**Implementation Steps**:

1. **Stripe Setup & Configuration (30 min, 500 tokens)**:
   ```typescript
   // lib/stripe.ts
   import Stripe from 'stripe';
   
   export const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY!, {
     apiVersion: '2023-10-16'
   });
   
   export const SUBSCRIPTION_PLANS = {
     free: {
       name: 'Free',
       price: 0,
       generations: 25,
       features: ['Basic templates', 'Download sites', 'Community support']
     },
     pro: {
       name: 'Pro',
       price: 29,
       priceId: 'price_pro_monthly',
       generations: -1, // unlimited
       features: [
         'Unlimited generations',
         'Premium templates',
         'Custom domains',
         'Priority support',
         'Analytics dashboard'
       ]
     }
   };
   ```

2. **Subscription Management (1 hour, 1500 tokens)**:
   ```typescript
   // services/subscriptionService.ts
   export const createSubscription = async (
     userId: string,
     priceId: string,
     paymentMethodId: string
   ) => {
     try {
       const subscription = await stripe.subscriptions.create({
         customer: await getOrCreateCustomer(userId),
         items: [{ price: priceId }],
         default_payment_method: paymentMethodId,
         expand: ['latest_invoice.payment_intent']
       });
   
       // Update user profile
       await supabase
         .from('profiles')
         .update({
           tier: 'pro',
           stripe_subscription_id: subscription.id,
           updated_at: new Date().toISOString()
         })
         .eq('id', userId);
   
       return subscription;
     } catch (error) {
       console.error('Subscription creation failed:', error);
       throw error;
     }
   };
   
   export const handleWebhook = async (event: Stripe.Event) => {
     switch (event.type) {
       case 'customer.subscription.updated':
       case 'customer.subscription.deleted':
         const subscription = event.data.object as Stripe.Subscription;
         await updateUserSubscription(subscription);
         break;
       
       case 'invoice.payment_failed':
         const invoice = event.data.object as Stripe.Invoice;
         await handlePaymentFailure(invoice);
         break;
     }
   };
   ```

3. **Payment UI Components (1.5 hours, 2500 tokens)**:
   ```typescript
   // components/payments/SubscriptionModal.tsx
   export const SubscriptionModal: React.FC<{
     isOpen: boolean;
     onClose: () => void;
   }> = ({ isOpen, onClose }) => {
     const [loading, setLoading] = useState(false);
     const [selectedPlan, setSelectedPlan] = useState<'pro'>('pro');
     const { user } = useAuth();
     const { addNotification } = useNotifications();
   
     const handleSubscribe = async () => {
       if (!user) return;
   
       setLoading(true);
       try {
         const { error } = await stripe.redirectToCheckout({
           lineItems: [{
             price: SUBSCRIPTION_PLANS[selectedPlan].priceId,
             quantity: 1
           }],
           mode: 'subscription',
           successUrl: `${window.location.origin}/success`,
           cancelUrl: `${window.location.origin}/pricing`,
           customerEmail: user.email
         });
   
         if (error) {
           addNotification({
             type: 'error',
             title: 'Payment Error',
             message: error.message || 'Failed to process payment'
           });
         }
       } catch (error) {
         console.error('Subscription error:', error);
         addNotification({
           type: 'error',
           title: 'Subscription Failed',
           message: 'Unable to process subscription. Please try again.'
         });
       } finally {
         setLoading(false);
       }
     };
   
     return (
       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
         <div className="glass-container max-w-md w-full p-6">
           <h2 className="text-xl font-bold mb-4">Upgrade to Pro</h2>
           
           <div className="glass-card p-4 mb-6 border-wu-gold">
             <div className="flex justify-between items-center mb-2">
               <span className="font-semibold">Pro Plan</span>
               <span className="text-wu-gold font-bold">$29/month</span>
             </div>
             <ul className="text-sm space-y-1">
               {SUBSCRIPTION_PLANS.pro.features.map(feature => (
                 <li key={feature} className="flex items-center">
                   <span className="text-wu-gold mr-2">✓</span>
                   {feature}
                 </li>
               ))}
             </ul>
           </div>
   
           <div className="flex gap-3">
             <button
               onClick={handleSubscribe}
               disabled={loading}
               className="btn-primary flex-1"
             >
               {loading ? 'Processing...' : 'Subscribe Now'}
             </button>
             <button onClick={onClose} className="btn-secondary">
               Cancel
             </button>
           </div>
         </div>
       </div>
     );
   };
   ```

**Acceptance Criteria**:
- ✅ Stripe integration functional
- ✅ Subscription creation and management
- ✅ Webhook handling for subscription events
- ✅ User upgrade/downgrade functionality
- ✅ Payment failure handling

---

### TASK 8: Usage Analytics & Dashboard
**Priority**: MEDIUM  
**Time Estimate**: 2 hours  
**Token Estimate**: 2,800 tokens  

**Implementation Steps**:

1. **Analytics Tracking (45 min, 1000 tokens)**:
   ```typescript
   // services/analytics.ts
   interface AnalyticsEvent {
     event: string;
     properties: Record<string, any>;
     userId?: string;
     timestamp: Date;
   }
   
   class Analytics {
     private events: AnalyticsEvent[] = [];
   
     track(event: string, properties: Record<string, any> = {}) {
       const analyticsEvent: AnalyticsEvent = {
         event,
         properties,
         userId: this.getCurrentUserId(),
         timestamp: new Date()
       };
   
       this.events.push(analyticsEvent);
       this.sendToServer(analyticsEvent);
   
       // Also send to Google Analytics if available
       if (typeof gtag !== 'undefined') {
         gtag('event', event, properties);
       }
     }
   
     private async sendToServer(event: AnalyticsEvent) {
       try {
         await supabase.from('analytics_events').insert({
           event_name: event.event,
           properties: event.properties,
           user_id: event.userId,
           created_at: event.timestamp.toISOString()
         });
       } catch (error) {
         console.error('Analytics tracking failed:', error);
       }
     }
   
     private getCurrentUserId(): string | undefined {
       // Get from auth context or return undefined for anonymous
       return supabase.auth.getUser().then(({ data }) => data.user?.id);
     }
   }
   
   export const analytics = new Analytics();
   
   // Usage tracking hooks
   export const useAnalytics = () => {
     const trackSiteGeneration = (repoUrl: string, generationTime: number) => {
       analytics.track('site_generated', {
         repository_url: repoUrl,
         generation_time_ms: generationTime,
         timestamp: Date.now()
       });
     };
   
     const trackUserSignup = (method: string) => {
       analytics.track('user_signup', { method });
     };
   
     const trackSubscription = (plan: string) => {
       analytics.track('subscription_created', { plan });
     };
   
     return { trackSiteGeneration, trackUserSignup, trackSubscription };
   };
   ```

2. **User Dashboard (1 hour 15 min, 1800 tokens)**:
   ```typescript
   // components/dashboard/UserDashboard.tsx
   export const UserDashboard: React.FC = () => {
     const { user, profile } = useAuth();
     const [analytics, setAnalytics] = useState<any>(null);
     const [generations, setGenerations] = useState<any[]>([]);
   
     useEffect(() => {
       if (user) {
         fetchUserAnalytics();
         fetchUserGenerations();
       }
     }, [user]);
   
     const fetchUserAnalytics = async () => {
       const { data } = await supabase
         .from('analytics_events')
         .select('*')
         .eq('user_id', user!.id)
         .order('created_at', { ascending: false });
       
       setAnalytics(processAnalyticsData(data));
     };
   
     const fetchUserGenerations = async () => {
       const { data } = await supabase
         .from('generations')
         .select('*')
         .eq('user_id', user!.id)
         .order('generated_at', { ascending: false })
         .limit(10);
       
       setGenerations(data || []);
     };
   
     return (
       <div className="min-h-screen bg-gradient-professional p-6">
         <div className="max-w-6xl mx-auto">
           <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="glass-card p-6">
               <h3 className="text-lg font-semibold mb-2">Generations Used</h3>
               <div className="text-3xl font-bold text-wu-gold">
                 {profile?.generations_used || 0}
               </div>
               <div className="text-sm text-wu-gold-muted">
                 of {profile?.generations_limit === -1 ? '∞' : profile?.generations_limit} this month
               </div>
             </div>
             
             <div className="glass-card p-6">
               <h3 className="text-lg font-semibold mb-2">Account Type</h3>
               <div className="text-2xl font-bold capitalize">
                 {profile?.tier || 'Free'}
               </div>
               {profile?.tier === 'free' && (
                 <button className="btn-primary mt-2 text-sm">
                   Upgrade to Pro
                 </button>
               )}
             </div>
             
             <div className="glass-card p-6">
               <h3 className="text-lg font-semibold mb-2">Total Sites</h3>
               <div className="text-3xl font-bold text-wu-gold">
                 {generations.length}
               </div>
               <div className="text-sm text-wu-gold-muted">
                 sites generated
               </div>
             </div>
           </div>
   
           <div className="glass-card p-6">
             <h3 className="text-xl font-semibold mb-4">Recent Generations</h3>
             <div className="space-y-3">
               {generations.map(generation => (
                 <div key={generation.id} className="flex items-center justify-between p-3 glass-card">
                   <div>
                     <div className="font-medium">{generation.repository_url}</div>
                     <div className="text-sm text-wu-gold-muted">
                       {new Date(generation.generated_at).toLocaleDateString()}
                     </div>
                   </div>
                   <div className="text-sm">
                     {generation.generation_time_ms}ms
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </div>
     );
   };
   ```

**Acceptance Criteria**:
- ✅ Event tracking for all user actions
- ✅ User dashboard with usage statistics
- ✅ Generation history display
- ✅ Subscription status and management
- ✅ Performance metrics visualization

---

## 🚀 DEPLOYMENT & MONITORING (Hour 13)

### TASK 9: Production Monitoring & Alerting
**Priority**: HIGH  
**Time Estimate**: 1 hour  
**Token Estimate**: 1,200 tokens  

**Implementation Steps**:

1. **Health Check System (20 min, 400 tokens)**:
   ```typescript
   // utils/monitoring.ts
   export const performSystemHealthCheck = async () => {
     const checks = {
       database: false,
       ai_service: false,
       payments: false,
       overall: false
     };
   
     try {
       // Database check
       const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
       checks.database = !dbError;
   
       // AI service check
       const aiResponse = await fetch('https://openrouter.ai/api/v1/models', {
         headers: { 'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}` }
       });
       checks.ai_service = aiResponse.ok;
   
       // Payments check (ping Stripe)
       checks.payments = true; // Implement actual Stripe ping
   
       checks.overall = checks.database && checks.ai_service && checks.payments;
     } catch (error) {
       console.error('Health check failed:', error);
     }
   
     return checks;
   };
   ```

2. **Error Monitoring (25 min, 500 tokens)**:
   ```typescript
   // utils/errorMonitoring.ts
   class ErrorMonitor {
     private errorRate = 0;
     private errorWindow = 5 * 60 * 1000; // 5 minutes
     private maxErrorRate = 0.1; // 10%
   
     reportError(error: Error, context?: string) {
       console.error('Application error:', error, context);
   
       // Send to external monitoring service
       this.sendToSentry(error, context);
       
       // Track internal metrics
       this.updateErrorRate();
       
       // Alert if error rate too high
       if (this.errorRate > this.maxErrorRate) {
         this.triggerAlert('High error rate detected');
       }
     }
   
     private sendToSentry(error: Error, context?: string) {
       // Implement Sentry integration
       if (typeof window !== 'undefined' && (window as any).Sentry) {
         (window as any).Sentry.captureException(error, { extra: { context } });
       }
     }
   
     private updateErrorRate() {
       // Implement sliding window error rate calculation
     }
   
     private triggerAlert(message: string) {
       console.warn('ALERT:', message);
       // Send to alerting service (email, Slack, etc.)
     }
   }
   
   export const errorMonitor = new ErrorMonitor();
   ```

3. **Performance Monitoring (15 min, 300 tokens)**:
   ```typescript
   // utils/performanceMonitoring.ts
   export const trackPerformanceMetric = (name: string, value: number) => {
     // Web Vitals tracking
     if (typeof window !== 'undefined') {
       const metric = { name, value, timestamp: Date.now() };
       
       // Send to analytics
       analytics.track('performance_metric', metric);
       
       // Store locally for debugging
       const metrics = JSON.parse(localStorage.getItem('perf_metrics') || '[]');
       metrics.push(metric);
       localStorage.setItem('perf_metrics', JSON.stringify(metrics.slice(-100)));
     }
   };
   
   // Usage
   export const trackSiteGenerationPerformance = (startTime: number) => {
     const duration = Date.now() - startTime;
     trackPerformanceMetric('site_generation_time', duration);
   };
   ```

**Acceptance Criteria**:
- ✅ System health checks operational
- ✅ Error monitoring with alerting
- ✅ Performance metric tracking
- ✅ External monitoring service integration
- ✅ Alert thresholds configured

---

## 🎯 FINAL VALIDATION (Hour 14)

### TASK 10: End-to-End Testing & Launch Validation
**Priority**: CRITICAL  
**Time Estimate**: 1 hour  
**Token Estimate**: 800 tokens  

**Testing Checklist**:

1. **Critical User Flows (30 min)**:
   - [ ] Anonymous user generates 3 sites → sees sign-up prompt
   - [ ] User signs up → gets 25 generation limit
   - [ ] User upgrades to Pro → gets unlimited generations
   - [ ] URL auto-completion works for all common formats
   - [ ] Error handling graceful for all failure modes

2. **Performance Validation (15 min)**:
   - [ ] Site generation < 30 seconds
   - [ ] Page load < 3 seconds
   - [ ] Mobile responsive design works
   - [ ] Core Web Vitals in green zone

3. **Production Readiness (15 min)**:
   - [ ] Environment variables configured
   - [ ] Monitoring and alerting active
   - [ ] Payment processing functional
   - [ ] Database backups configured
   - [ ] SSL certificates valid

**Launch Criteria**:
- ✅ All critical user flows working
- ✅ Performance targets met
- ✅ Payment system operational
- ✅ Monitoring systems active
- ✅ Error rates < 1%

---

## 📊 RESOURCE ALLOCATION SUMMARY

### Time Distribution:
- **Bug Fixes & Core Features**: 4 hours (33%)
- **Authentication & Conversion**: 3 hours (25%)
- **Performance & Error Handling**: 4 hours (33%)
- **Monetization & Analytics**: 3 hours (25%)
- **Testing & Validation**: 1 hour (8%)

### Token Usage Distribution:
- **Authentication Implementation**: 12,000 tokens (27%)
- **UI Components**: 15,000 tokens (33%)
- **API Integration**: 10,000 tokens (22%)
- **Error Handling**: 5,000 tokens (11%)
- **Testing & Documentation**: 3,000 tokens (7%)

### Priority Matrix:
**CRITICAL (Must Have)**:
- URL auto-completion fix
- Authentication system
- Payment integration
- Error handling

**HIGH (Should Have)**:
- Performance optimization
- Analytics tracking
- User dashboard
- Monitoring system

**MEDIUM (Nice to Have)**:
- Advanced caching
- Extended templates
- Social features
- Admin dashboard

---

## 🔄 AUTOMATION OPPORTUNITIES

### Parallel Execution:
- Tasks 1-4 can run in parallel (different components)
- Tasks 5-6 can run parallel to Tasks 7-8
- Testing can start as soon as core features complete

### CI/CD Integration:
- Automated testing on each commit
- Staging deployment for validation
- Production deployment on approval
- Rollback capability for failures

### Monitoring Automation:
- Automated health checks every 5 minutes
- Error rate alerting with thresholds
- Performance degradation notifications
- Usage spike alerts

---

*Total Implementation Time: 12.5 hours*  
*Total Token Budget: ~45,000 tokens*  
*Expected Launch: Within 2 working days*  
*Success Metrics: Working product with paying users*