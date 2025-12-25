import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Printer, ArrowLeft, CheckCircle2, XCircle, Star, Shield, Globe, 
    Lock, Sparkles, TrendingUp, AlertTriangle, Users, Zap, 
    BarChart3, Target, Award, FileText, Calendar
} from "lucide-react";

// RIGHTNAME Logo URL
const LOGO_URL = "https://customer-assets.emergentagent.com/job_38043537-e3af-491b-9b60-3b8b2372877a/artifacts/9yz5wf80_rightname.ai%20logo%20%281%29.png";

// Helper function to parse markdown bold
const parseMarkdownBold = (text) => {
    if (!text) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

// ============ PRINT-SAFE CARD WRAPPER ============
const PrintCard = ({ children, className = "" }) => (
    <div className={`print-card break-inside-avoid ${className}`}>
        {children}
    </div>
);

// ============ COVER PAGE (Print Only) ============
const CoverPage = ({ brandName, score, verdict, date, query }) => (
    <div className="hidden print:flex print:flex-col print:min-h-screen print:items-center print:justify-center print:bg-white print:p-12">
        <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
                <img src={LOGO_URL} alt="RIGHTNAME" className="h-16 mx-auto" />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-6xl font-black text-slate-900 mb-4">{brandName}</h1>
            
            {/* Score Badge */}
            <div className="inline-flex items-center gap-4 mb-8">
                <div className={`px-6 py-3 rounded-full text-2xl font-black ${
                    verdict === 'GO' ? 'bg-emerald-100 text-emerald-700' :
                    verdict === 'CONDITIONAL GO' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {score}/100 • {verdict}
                </div>
            </div>
            
            {/* Meta Info */}
            <div className="text-slate-500 space-y-2">
                <p className="text-lg">{query?.category} • {query?.market_scope}</p>
                <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {date}
                </p>
            </div>
            
            {/* Divider */}
            <div className="w-32 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto my-8 rounded-full"></div>
            
            <p className="text-sm text-slate-400 uppercase tracking-widest">Brand Name Analysis Report</p>
        </div>
    </div>
);

// ============ SECTION HEADER ============
const SectionHeader = ({ icon: Icon, title, subtitle, color = "violet" }) => {
    const colors = {
        violet: "from-violet-500 to-violet-600 text-violet-600 bg-violet-100",
        emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-100",
        fuchsia: "from-fuchsia-500 to-fuchsia-600 text-fuchsia-600 bg-fuchsia-100",
        amber: "from-amber-500 to-amber-600 text-amber-600 bg-amber-100",
        blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-100",
    };
    
    return (
        <div className="flex items-center gap-3 mb-6 print:mb-4">
            <div className={`w-10 h-10 rounded-xl ${colors[color].split(' ')[2]} flex items-center justify-center print:w-8 print:h-8`}>
                <Icon className={`w-5 h-5 ${colors[color].split(' ')[1]} print:w-4 print:h-4`} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 print:text-lg">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
        </div>
    );
};

// ============ SCORE CARD (Revamped) ============
const ScoreCardRevamped = ({ score, verdict }) => {
    const getVerdictStyle = () => {
        switch(verdict) {
            case 'GO': return 'from-emerald-400 to-teal-500 text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'CONDITIONAL GO': return 'from-amber-400 to-orange-500 text-amber-700 bg-amber-50 border-amber-200';
            case 'NO-GO': 
            case 'REJECT': return 'from-red-400 to-rose-500 text-red-700 bg-red-50 border-red-200';
            default: return 'from-slate-400 to-slate-500 text-slate-700 bg-slate-50 border-slate-200';
        }
    };
    
    const style = getVerdictStyle();
    
    return (
        <PrintCard>
            <div className={`rounded-2xl p-6 border-2 ${style.split(' ').slice(2).join(' ')} print:p-4`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">RIGHTNAME™ INDEX</span>
                    <Award className="w-5 h-5 opacity-50" />
                </div>
                <div className="text-center py-4 print:py-2">
                    <div className="text-7xl font-black print:text-5xl">{score}</div>
                    <div className="text-xl text-slate-400 font-bold">/100</div>
                </div>
                <div className={`text-center py-2 px-4 rounded-xl bg-gradient-to-r ${style.split(' ').slice(0, 2).join(' ')} text-white font-bold`}>
                    {verdict}
                </div>
            </div>
        </PrintCard>
    );
};

// ============ DIMENSION CARD (Revamped) ============
const DimensionCard = ({ dimension, index }) => {
    const getScoreColor = (score) => {
        if (score >= 8) return 'from-emerald-400 to-emerald-500';
        if (score >= 6) return 'from-violet-400 to-fuchsia-500';
        return 'from-amber-400 to-orange-500';
    };
    
    const icons = ['✨', '🎯', '🛡️', '🌍', '💫', '🔮', '⚡', '🎨'];
    
    return (
        <PrintCard>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-shadow print:p-4 print:border-slate-300">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{icons[index % icons.length]}</span>
                        <h4 className="font-bold text-slate-800 text-sm">{dimension.name}</h4>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(dimension.score)} text-white text-sm font-bold`}>
                        {dimension.score}/10
                    </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(dimension.score)}`}
                        style={{ width: `${dimension.score * 10}%` }}
                    />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    {parseMarkdownBold(dimension.reasoning)}
                </p>
            </div>
        </PrintCard>
    );
};

// ============ STRENGTHS & RISKS CARDS ============
const StrengthsRisksCard = ({ pros, cons }) => (
    <PrintCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
            {/* Strengths */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-5 print:p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-emerald-700">Key Strengths</h4>
                </div>
                <ul className="space-y-2">
                    {pros?.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-emerald-500 mt-0.5">✓</span>
                            {pro}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Risks */}
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-5 print:p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-amber-700">Potential Risks</h4>
                </div>
                <ul className="space-y-2">
                    {cons?.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-amber-500 mt-0.5">!</span>
                            {con}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </PrintCard>
);

// ============ COMPETITOR CARD ============
const CompetitorCard = ({ competitor }) => {
    const getRiskColor = (risk) => {
        if (risk === 'LOW' || risk === 'Low') return 'bg-emerald-100 text-emerald-700';
        if (risk === 'MEDIUM' || risk === 'Medium') return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };
    
    return (
        <PrintCard>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">
                        🏢
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{competitor.name}</h4>
                        <p className="text-xs text-slate-500">
                            {competitor.category || 'Similar Category'} • {competitor.similarity || 'N/A'}% overlap
                        </p>
                    </div>
                </div>
                <Badge className={`${getRiskColor(competitor.conflict_level || competitor.risk || 'LOW')} font-bold`}>
                    {competitor.conflict_level || competitor.risk || 'Low'} Risk
                </Badge>
            </div>
        </PrintCard>
    );
};

// ============ DOMAIN CARD ============
const DomainCard = ({ domain, status, note }) => {
    const isAvailable = status?.toLowerCase().includes('available') || status?.toLowerCase().includes('free');
    
    return (
        <PrintCard>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="font-mono font-bold text-slate-800">{domain}</span>
                </div>
                <div className="text-right">
                    <Badge className={isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        {isAvailable ? '✓ Available' : '✗ Taken'}
                    </Badge>
                    {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
                </div>
            </div>
        </PrintCard>
    );
};

// ============ CULTURAL CARD ============
const CulturalCard = ({ country, score, notes }) => {
    const flags = {
        'USA': '🇺🇸', 'India': '🇮🇳', 'UK': '🇬🇧', 'Germany': '🇩🇪', 
        'France': '🇫🇷', 'Japan': '🇯🇵', 'China': '🇨🇳', 'Brazil': '🇧🇷',
        'Canada': '🇨🇦', 'Australia': '🇦🇺'
    };
    
    return (
        <PrintCard>
            <div className="bg-gradient-to-br from-fuchsia-50 to-white border border-fuchsia-200 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{flags[country] || '🌍'}</div>
                <h4 className="font-bold text-slate-800 mb-1">{country}</h4>
                <div className="text-2xl font-black text-fuchsia-600 mb-2">{score}/10</div>
                <p className="text-xs text-slate-500">{notes}</p>
            </div>
        </PrintCard>
    );
};

// ============ FINAL VERDICT BANNER ============
const FinalVerdictBanner = ({ verdict, score, assessment }) => {
    const getStyle = () => {
        if (verdict === 'GO') return 'from-emerald-500 via-teal-500 to-cyan-500';
        if (verdict === 'CONDITIONAL GO') return 'from-amber-500 via-orange-500 to-yellow-500';
        return 'from-red-500 via-rose-500 to-pink-500';
    };
    
    return (
        <PrintCard>
            <div className={`bg-gradient-to-r ${getStyle()} rounded-2xl p-8 text-white print:p-6`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center print:w-12 print:h-12">
                            <Zap className="w-8 h-8 print:w-6 print:h-6" />
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-widest opacity-80">Final Verdict</p>
                            <h2 className="text-3xl font-black print:text-2xl">{verdict}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                            <p className="text-xs opacity-80">Score</p>
                            <p className="text-2xl font-black">{score}/100</p>
                        </div>
                    </div>
                </div>
                {assessment?.bottom_line && (
                    <p className="mt-4 text-white/90 text-sm border-t border-white/20 pt-4">
                        {assessment.bottom_line}
                    </p>
                )}
            </div>
        </PrintCard>
    );
};

// ============ LOCKED SECTION ============
const LockedSection = ({ title, teaser, icon: Icon, onUnlock }) => (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white print:hidden">
        <div className="p-8 filter blur-sm opacity-50 pointer-events-none select-none">
            <div className="h-4 w-3/4 bg-slate-200 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-3"></div>
            <div className="h-20 w-full bg-slate-100 rounded mb-3"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <div className="text-center px-6 py-8 max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-6">{teaser}</p>
                <Button onClick={onUnlock} className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold rounded-xl px-6">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Register to Unlock
                </Button>
            </div>
        </div>
    </div>
);

// ============ REGISTER CTA BANNER ============
const RegisterCTABanner = ({ onRegister }) => (
    <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 rounded-2xl p-6 text-white mb-8 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black">Unlock Your Full Report</h3>
                    <p className="text-sm text-white/80">Register free to see detailed analysis</p>
                </div>
            </div>
            <Button onClick={onRegister} className="bg-white text-violet-700 hover:bg-slate-100 font-bold rounded-xl px-6">
                Register Now — It's Free
            </Button>
        </div>
    </div>
);

// ============ MAIN DASHBOARD ============
const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, openAuthModal } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [queryData, setQueryData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const isAuthenticated = !!user;
    const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });

    useEffect(() => {
        if (location.state?.data) {
            setReportData(location.state.data);
            setQueryData(location.state.query);
            localStorage.setItem('current_report', JSON.stringify(location.state.data));
            localStorage.setItem('current_query', JSON.stringify(location.state.query));
        } else {
            const savedReport = localStorage.getItem('current_report');
            const savedQuery = localStorage.getItem('current_query');
            if (savedReport && savedQuery) {
                setReportData(JSON.parse(savedReport));
                setQueryData(JSON.parse(savedQuery));
            }
        }
        setLoading(false);
    }, [location.state]);

    const handleRegister = () => {
        localStorage.setItem('auth_return_url', '/dashboard');
        openAuthModal(reportData?.report_id);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading Report...</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Session Expired</h2>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    const data = reportData;
    const query = queryData || {};
    const brand = data.brand_scores?.[0];

    if (!brand) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Invalid Report Data</h2>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    const lockedSections = {
        strategy: { title: "Strategy Snapshot", teaser: "Discover your brand's strategic classification..." },
        dimensions: { title: "Dimensions Analysis", teaser: "See how your brand scores across 8 key frameworks..." },
        trademark: { title: "Legal Risk Matrix", teaser: "Understand potential trademark conflicts..." },
        domain: { title: "Digital Presence", teaser: "Check domain and social media availability..." },
        competitor: { title: "Competitive Landscape", teaser: "See who you're competing against..." },
        cultural: { title: "Cultural Analysis", teaser: "Understand how your brand resonates globally..." },
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { 
                        size: A4 portrait; 
                        margin: 15mm; 
                    }
                    body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    .print-card { 
                        break-inside: avoid !important; 
                        page-break-inside: avoid !important;
                    }
                    .print-section {
                        break-before: auto;
                        page-break-before: auto;
                    }
                    .print-section-header {
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Cover Page (Print Only) */}
            <CoverPage 
                brandName={brand.brand_name}
                score={brand.namescore}
                verdict={brand.verdict}
                date={currentDate}
                query={query}
            />

            {/* Screen Navbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center no-print sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <img src={LOGO_URL} alt="RIGHTNAME" className="h-8" />
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hidden md:flex">{query.category} • {query.market_scope}</Badge>
                    {isAuthenticated ? (
                        <Button onClick={() => window.print()} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                            <Printer className="h-4 w-4" />
                            Export PDF
                        </Button>
                    ) : (
                        <Button onClick={handleRegister} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                            <Lock className="h-4 w-4" />
                            Unlock Full Report
                        </Button>
                    )}
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block px-6 py-4 border-b-2 border-slate-200 mb-6">
                <div className="flex justify-between items-center">
                    <img src={LOGO_URL} alt="RIGHTNAME" className="h-6" />
                    <span className="text-sm text-slate-500">{currentDate}</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8 space-y-10 print:px-0 print:py-0 print:space-y-6">
                
                {/* CTA Banner */}
                {!isAuthenticated && <RegisterCTABanner onRegister={handleRegister} />}

                {/* ===== SECTION 1: HERO ===== */}
                <section className="print-section">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
                        {/* Brand Info */}
                        <div className="lg:col-span-2">
                            <PrintCard>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 print:p-4">
                                    <h1 className="text-5xl font-black text-slate-900 mb-3 print:text-4xl">
                                        {brand.brand_name}
                                    </h1>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge className="bg-slate-900 text-white font-bold">{brand.verdict}</Badge>
                                        <Badge variant="outline">{brand.positioning_fit} positioning</Badge>
                                        {!isAuthenticated && (
                                            <Badge className="bg-amber-100 text-amber-700 no-print">
                                                <Lock className="w-3 h-3 mr-1" /> Preview
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Executive Summary</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed print:text-sm">
                                        {data.executive_summary}
                                    </p>
                                </div>
                            </PrintCard>
                        </div>
                        
                        {/* Score Card */}
                        <div>
                            <ScoreCardRevamped score={brand.namescore} verdict={brand.verdict} />
                        </div>
                    </div>
                </section>

                {/* ===== SECTION 2: QUICK DIMENSIONS ===== */}
                <section className="print-section">
                    <div className="print-section-header">
                        <SectionHeader icon={BarChart3} title="Quick Dimensions" subtitle="Framework scores at a glance" color="violet" />
                    </div>
                    {isAuthenticated ? (
                        <PrintCard>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 print:p-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:gap-3">
                                    {brand.dimensions?.slice(0, 6).map((dim, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">{dim.name}</span>
                                                <span className="text-sm font-black text-slate-800">{dim.score}/10</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        dim.score >= 8 ? 'bg-emerald-500' : 
                                                        dim.score >= 6 ? 'bg-violet-500' : 'bg-amber-500'
                                                    }`}
                                                    style={{ width: `${dim.score * 10}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PrintCard>
                    ) : (
                        <LockedSection {...lockedSections.dimensions} onUnlock={handleRegister} />
                    )}
                </section>

                {/* ===== SECTION 3: STRATEGY ===== */}
                <section className="print-section">
                    <div className="print-section-header">
                        <SectionHeader icon={Target} title="Strategy Snapshot" subtitle="Strengths and risks analysis" color="emerald" />
                    </div>
                    {isAuthenticated ? (
                        <>
                            {brand.strategic_classification && (
                                <PrintCard className="mb-4">
                                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                                        <p className="text-lg font-bold text-violet-900 italic">"{brand.strategic_classification}"</p>
                                    </div>
                                </PrintCard>
                            )}
                            <StrengthsRisksCard pros={brand.pros} cons={brand.cons} />
                        </>
                    ) : (
                        <LockedSection {...lockedSections.strategy} onUnlock={handleRegister} />
                    )}
                </section>

                {/* ===== SECTION 4: DETAILED DIMENSIONS ===== */}
                {isAuthenticated && brand.dimensions && (
                    <section className="print-section">
                        <div className="print-section-header">
                            <SectionHeader icon={BarChart3} title="Detailed Framework Analysis" subtitle="In-depth scoring breakdown" color="fuchsia" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                            {brand.dimensions.map((dim, i) => (
                                <DimensionCard key={i} dimension={dim} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ===== SECTION 5: COMPETITORS ===== */}
                {brand.competitor_analysis && (
                    <section className="print-section">
                        <div className="print-section-header">
                            <SectionHeader icon={Users} title="Competitive Landscape" subtitle="Market overlap analysis" color="blue" />
                        </div>
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                {/* Support both data structures */}
                                {(brand.competitor_analysis.competitors || brand.competitor_analysis.true_market_competitors)?.slice(0, 6).map((comp, i) => (
                                    <CompetitorCard key={i} competitor={comp} />
                                ))}
                                {/* Positioning Matrix Info */}
                                {(brand.competitor_analysis.x_axis_label || brand.competitor_analysis.y_axis_label) && (
                                    <PrintCard>
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm text-blue-700">
                                                <strong>Positioning Matrix:</strong> {brand.competitor_analysis.x_axis_label} vs {brand.competitor_analysis.y_axis_label}
                                            </p>
                                        </div>
                                    </PrintCard>
                                )}
                                {brand.competitor_analysis.analysis_note && (
                                    <PrintCard>
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm text-blue-700">{brand.competitor_analysis.analysis_note}</p>
                                        </div>
                                    </PrintCard>
                                )}
                            </div>
                        ) : (
                            <LockedSection {...lockedSections.competitor} onUnlock={handleRegister} />
                        )}
                    </section>
                )}

                {/* ===== SECTION 6: DOMAINS ===== */}
                {(brand.multi_domain_availability || brand.domain_analysis) && (
                    <section className="print-section">
                        <div className="print-section-header">
                            <SectionHeader icon={Globe} title="Digital Presence" subtitle="Domain & social availability" color="amber" />
                        </div>
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                {/* Category Domains */}
                                {brand.multi_domain_availability?.category_domains?.map((d, i) => (
                                    <DomainCard key={`cat-${i}`} domain={d.domain} status={d.status || (d.available ? 'Available' : 'Taken')} />
                                ))}
                                {/* Country Domains */}
                                {brand.multi_domain_availability?.country_domains?.map((d, i) => (
                                    <DomainCard key={`country-${i}`} domain={d.domain} status={d.status || (d.available ? 'Available' : 'Taken')} />
                                ))}
                                {/* Fallback: domains array */}
                                {brand.multi_domain_availability?.domains?.map((d, i) => (
                                    <DomainCard key={`dom-${i}`} domain={d.domain} status={d.status} note={d.registrar} />
                                ))}
                                {/* Domain alternatives from domain_analysis */}
                                {brand.domain_analysis?.alternatives?.map((alt, i) => (
                                    <DomainCard key={`alt-${i}`} domain={alt.domain || alt} status={alt.status || 'Suggested'} />
                                ))}
                                {/* Domain Strategy Note */}
                                {brand.domain_analysis?.strategy_note && (
                                    <PrintCard>
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                            <p className="text-sm text-amber-700">
                                                <strong>💡 Strategy:</strong> {brand.domain_analysis.strategy_note}
                                            </p>
                                        </div>
                                    </PrintCard>
                                )}
                                {/* Exact Match Status */}
                                {brand.domain_analysis?.exact_match_status && (
                                    <PrintCard>
                                        <div className={`rounded-xl p-4 ${brand.domain_analysis.exact_match_status === 'AVAILABLE' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                            <p className={`text-sm ${brand.domain_analysis.exact_match_status === 'AVAILABLE' ? 'text-emerald-700' : 'text-red-700'}`}>
                                                <strong>.com Status:</strong> {brand.domain_analysis.exact_match_status} 
                                                {brand.domain_analysis.risk_level && ` (Risk: ${brand.domain_analysis.risk_level})`}
                                            </p>
                                        </div>
                                    </PrintCard>
                                )}
                            </div>
                        ) : (
                            <LockedSection {...lockedSections.domain} onUnlock={handleRegister} />
                        )}
                    </section>
                )}

                {/* ===== SECTION 7: CULTURAL ===== */}
                {brand.cultural_analysis && (
                    <section className="print-section">
                        <div className="print-section-header">
                            <SectionHeader icon={Globe} title="Cultural Resonance" subtitle="Global market fit" color="fuchsia" />
                        </div>
                        {isAuthenticated ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:gap-3">
                                {brand.cultural_analysis.map((c, i) => (
                                    <CulturalCard key={i} country={c.country} score={c.cultural_resonance_score} notes={c.cultural_notes} />
                                ))}
                            </div>
                        ) : (
                            <LockedSection {...lockedSections.cultural} onUnlock={handleRegister} />
                        )}
                    </section>
                )}

                {/* ===== SECTION 8: FINAL VERDICT ===== */}
                {isAuthenticated && brand.final_assessment && (
                    <section className="print-section">
                        <div className="print-section-header">
                            <SectionHeader icon={Zap} title="Final Assessment" subtitle="Conclusive recommendation" color="emerald" />
                        </div>
                        <FinalVerdictBanner 
                            verdict={brand.verdict} 
                            score={brand.namescore} 
                            assessment={brand.final_assessment}
                        />
                        {brand.final_assessment.recommended_next_steps && (
                            <PrintCard className="mt-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-5">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-violet-500" />
                                        Recommended Next Steps
                                    </h4>
                                    <ul className="space-y-2">
                                        {brand.final_assessment.recommended_next_steps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <span className="text-violet-500 font-bold">{i + 1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </PrintCard>
                        )}
                    </section>
                )}

                {/* ===== BOTTOM CTA ===== */}
                {!isAuthenticated && (
                    <section className="no-print">
                        <div className="text-center p-8 bg-white rounded-2xl border-2 border-dashed border-violet-200">
                            <Lock className="w-12 h-12 mx-auto mb-4 text-violet-400" />
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Want the full picture?</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                Register for free to unlock all sections including trademark analysis, competitor insights, and strategic recommendations.
                            </p>
                            <Button onClick={handleRegister} size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold rounded-xl px-8">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Unlock Full Report — Free
                            </Button>
                        </div>
                    </section>
                )}

                {/* Print Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                    <p>Generated by RIGHTNAME • {currentDate} • rightname.ai</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
