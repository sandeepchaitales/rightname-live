import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lightbulb, AlertTriangle, ArrowUpRight, Minus, TrendingUp, Info, DollarSign, Sparkles, Scale, Globe, Instagram, Twitter, Facebook, Youtube, Linkedin, XCircle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// --- Design System Tokens ---
const CARD_STYLE = "bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden";

// --- Sub-Components ---

const CustomTick = ({ payload, x, y, cx, cy, ...rest }) => {
  return (
    <text
      {...rest}
      y={y + (y - cy) / 16}
      x={x + (x - cx) / 16}
      fontFamily="Outfit, sans-serif"
      fontSize={10}
      fontWeight={600}
      textAnchor="middle"
      fill="#64748b"
      className="uppercase tracking-wider"
    >
      <tspan x={x + (x - cx) / 16} dy="0em">{payload.value}</tspan>
    </text>
  );
};

export const BrandRadarChart = ({ data }) => {
  return (
    <div className="h-[400px] w-full min-w-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={(props) => <CustomTick {...props} />}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#7c3aed"
            strokeWidth={3}
            fill="#8b5cf6"
            fillOpacity={0.2}
            isAnimationActive={true}
            label={{ position: 'top', fill: '#7c3aed', fontSize: 12, fontWeight: 'bold' }}
          />
          <Tooltip 
            formatter={(value) => [<span className="font-bold text-violet-700">{value}/10</span>, 'Score']}
            contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '12px'
            }}
            itemStyle={{ color: '#1e293b' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-medium bg-white/80 px-2 py-1 rounded-md border border-slate-100">
        Scale: 0-10 (Higher is Better)
      </div>
    </div>
  );
};

export const ScoreCard = ({ title, score, verdict, subtitle, className }) => {
    let colorClass = "text-slate-900";
    let bgGradient = "from-slate-50 to-white";
    let statusIcon = <Minus className="w-4 h-4 text-slate-400" />;
    
    if (verdict === "GO") {
        colorClass = "text-emerald-600";
        bgGradient = "from-emerald-50/50 to-white";
        statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    } else if (verdict === "CONDITIONAL GO") {
        colorClass = "text-amber-600";
        bgGradient = "from-amber-50/50 to-white";
        statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
    } else if (verdict === "NO-GO" || verdict === "REJECT") {
        colorClass = "text-rose-600";
        bgGradient = "from-rose-50/50 to-white";
        statusIcon = <ArrowUpRight className="w-5 h-5 text-rose-500 rotate-180" />;
    }

    return (
        <Card className={`${CARD_STYLE} ${className} border-l-4 ${verdict === 'GO' ? 'border-l-emerald-500' : verdict === 'CONDITIONAL GO' ? 'border-l-amber-500' : 'border-l-rose-500'}`}>
            <CardHeader className={`pb-2 bg-gradient-to-br ${bgGradient} border-b border-slate-50`}>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-medium text-slate-400">
                            {subtitle}
                        </CardDescription>
                    </div>
                    {statusIcon}
                </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative">
                        <span className={`text-7xl font-black tracking-tighter ${colorClass}`}>
                            {score}
                        </span>
                        <span className="absolute top-2 -right-8 text-sm text-slate-400 font-bold">/100</span>
                    </div>
                    {verdict && (
                        <div className="mt-4">
                            <Badge className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide border-0 shadow-sm ${
                                verdict === 'GO' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                verdict === 'CONDITIONAL GO' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}>
                                {verdict}
                            </Badge>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// New Competitive Matrix Chart Component
const CompetitiveMatrixChart = ({ competitors }) => {
    // Helper to map string descriptors to coordinates
    const mapToCoordinates = (comp) => {
        let x = 50; // default Mid
        let y = 50; // default Fusion

        const price = (comp.price_axis || "").toLowerCase();
        if (price.includes("low") || price.includes("budget") || price.includes("mass")) x = 20;
        else if (price.includes("high") || price.includes("premium") || price.includes("luxury")) x = 80;
        else x = 50;

        const mod = (comp.modernity_axis || "").toLowerCase();
        if (mod.includes("traditional") || mod.includes("heritage") || mod.includes("classic")) y = 20;
        else if (mod.includes("modern") || mod.includes("avant") || mod.includes("contemporary")) y = 80;
        else y = 50;

        // Add some jitter to prevent overlap
        return {
            name: comp.name,
            x: x + (Math.random() * 6 - 3), 
            y: y + (Math.random() * 6 - 3),
            quadrant: comp.quadrant
        };
    };

    const data = competitors.map(mapToCoordinates);

    return (
        <div className="h-[400px] w-full bg-slate-50/30 rounded-xl border border-slate-100 relative p-4">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="Price" unit="" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" name="Modernity" unit="" domain={[0, 100]} hide />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="3 3" />
                    <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Scatter name="Competitors" data={data} fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7c3aed" : "#0ea5e9"} />
                        ))}
                        <LabelList dataKey="name" position="top" style={{ fontSize: 10, fontWeight: 'bold', fill: '#334155' }} />
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
            
            {/* Axis Labels */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Minus className="w-4 h-4" /> Price <ArrowUpRight className="w-4 h-4 rotate-45" />
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Minus className="w-4 h-4" /> Modernity <ArrowUpRight className="w-4 h-4 rotate-45" />
            </div>

            {/* Quadrant Labels */}
            <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 rounded">AVANT-GARDE LUXURY</div>
            <div className="absolute bottom-4 left-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 rounded">MASS TRADITIONAL</div>
            <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 rounded">MASS MODERN</div>
            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 rounded">HERITAGE LUXURY</div>
        </div>
    );
};

export const CompetitionAnalysis = ({ data, verdict }) => {
    // Check if pricing should be shown (only for GO/CONDITIONAL GO)
    const isPricingApplicable = verdict && !['REJECT', 'NO-GO'].includes(verdict.toUpperCase());
    const pricingText = data.suggested_pricing || '';
    const isNAPricing = pricingText.toLowerCase().includes('n/a') || pricingText.toLowerCase().includes('not applicable');
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: White Space & Strategy */}
            <Card className={`${CARD_STYLE} lg:col-span-1 flex flex-col`}>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-violet-600 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Opportunity
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-grow space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">White Space Analysis</h4>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {data.white_space_analysis}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Strategic Advantage</h4>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {data.strategic_advantage}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Recommended Pricing</h4>
                        <div className="text-2xl font-bold text-slate-900">{data.suggested_pricing}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Right: Competitor Matrix Chart */}
            <Card className={`${CARD_STYLE} lg:col-span-2`}>
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Strategic Positioning Matrix
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <CompetitiveMatrixChart competitors={data.competitors} />
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400 italic">
                            *Visual approximation based on market positioning
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const TrademarkRiskTable = ({ matrix, trademarkClasses }) => {
    if (!matrix) return null;

    const rows = [
        { label: "Genericness", ...matrix.genericness },
        { label: "Conflicts", ...matrix.existing_conflicts },
        { label: "Phonetic", ...matrix.phonetic_similarity },
        { label: "Classes", ...matrix.relevant_classes },
        { label: "Rebranding", ...matrix.rebranding_probability },
    ];

    const getZoneBadge = (zone) => {
        const zoneStr = zone.toLowerCase();
        if (zoneStr.includes("green")) return <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">LOW RISK</span>;
        if (zoneStr.includes("yellow") || zoneStr.includes("orange")) return <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">MODERATE</span>;
        if (zoneStr.includes("red")) return <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">HIGH RISK</span>;
        
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{zone.toUpperCase()}</span>;
    };

    return (
        <Card className={CARD_STYLE}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Legal Risk Assessment Matrix
                    </CardTitle>
                    <Badge variant="outline" className="bg-white text-slate-600">IP Analysis</Badge>
                 </div>
            </CardHeader>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                            <TableHead className="w-[20%] font-bold text-slate-800 pl-6 text-xs uppercase tracking-wide">Risk Factor</TableHead>
                            <TableHead className="w-[12%] text-center font-bold text-slate-800 text-xs uppercase tracking-wide">Probability</TableHead>
                            <TableHead className="w-[12%] text-center font-bold text-slate-800 text-xs uppercase tracking-wide">Severity</TableHead>
                            <TableHead className="w-[12%] text-center font-bold text-slate-800 text-xs uppercase tracking-wide">Zone</TableHead>
                            <TableHead className="w-[44%] font-bold text-slate-800 text-xs uppercase tracking-wide">Mitigation Strategy</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/30">
                                <TableCell className="font-bold text-slate-900 pl-6 text-sm">{row.label}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-sm font-bold text-slate-900">{row.likelihood}/10</span>
                                        <Progress value={row.likelihood * 10} className="h-1.5 w-16 bg-slate-100" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-sm font-bold text-slate-900">{row.severity}/10</span>
                                        <Progress value={row.severity * 10} className="h-1.5 w-16 bg-slate-100" color={row.severity > 7 ? 'bg-rose-500' : row.severity > 4 ? 'bg-amber-500' : 'bg-emerald-500'} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{getZoneBadge(row.zone)}</TableCell>
                                <TableCell className="text-xs text-slate-600 leading-relaxed py-4">{row.commentary}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {/* Trademark Classes Recommendation */}
            {trademarkClasses && trademarkClasses.length > 0 && (
                <div className="p-6 bg-violet-50 border-t border-violet-100">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3 flex items-center gap-2">
                        <Scale className="w-4 h-4" /> Recommended Nice Classes for Filing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {trademarkClasses.map((cls, i) => (
                            <Badge key={i} variant="outline" className="bg-white text-violet-800 border-violet-200 px-3 py-1 text-xs font-medium shadow-sm">
                                {cls}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 bg-white border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Overall Assessment</h4>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">{matrix.overall_assessment}</p>
            </div>
        </Card>
    );
};

export const DomainAvailabilityCard = ({ analysis }) => {
    if (!analysis) return null;

    const isTaken = analysis.exact_match_status.toLowerCase().includes("taken");

    return (
        <Card className={`${CARD_STYLE} h-full border-l-4 ${isTaken ? 'border-l-amber-400' : 'border-l-emerald-400'}`}>
            <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Domain Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div>
                    <div className={`text-xl font-bold ${isTaken ? 'text-amber-600' : 'text-emerald-600'} mb-1 break-words`}>
                        {analysis.exact_match_status.split(':')[0]}
                    </div>
                    <Badge variant="secondary" className={`mt-1 ${isTaken ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isTaken ? 'Registered' : 'Available'}
                    </Badge>
                </div>
                
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Alternatives</h4>
                    <div className="space-y-2">
                        {analysis.alternatives.map((alt, i) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-lg border border-slate-100 hover:border-violet-200 transition-colors">
                                <span className="font-bold text-slate-700 text-xs">{alt.domain}</span>
                                <span className="text-[10px] text-slate-400">{alt.example}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {analysis.strategy_note}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export const FinalAssessmentCard = ({ assessment }) => {
    if (!assessment) return null;

    // Determine scale for Suitability Score display
    const isOutOf10 = assessment.suitability_score <= 10;
    const denominator = isOutOf10 ? 10 : 100;

    return (
        <Card className={`${CARD_STYLE} ring-1 ring-slate-200 shadow-lg`}>
            <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <CardTitle className="text-lg font-bold tracking-tight">Final Assessment</CardTitle>
                </div>
                <p className="text-slate-400 text-sm font-medium">Consultant Verdict & Roadmap</p>
            </CardHeader>
            
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Verdict - 4 cols */}
                    <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
                        <div className="mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Suitability Score</span>
                            <span className="text-4xl font-black text-slate-900">
                                {assessment.suitability_score}
                                <span className="text-lg text-slate-400 font-medium">/{denominator}</span>
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                            "{assessment.verdict_statement}"
                        </p>
                    </div>

                    {/* Breakdown - 8 cols */}
                    <div className="md:col-span-8 p-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Strategic Roadmap</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            {assessment.recommendations.map((rec, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-violet-200 transition-all">
                                    <h5 className="font-bold text-slate-900 text-sm mb-2 text-violet-700">{rec.title}</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed">{rec.content}</p>
                                </div>
                            ))}
                        </div>
                        {assessment.alternative_path && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 items-start">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800 font-medium">{assessment.alternative_path}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Plan B - Alternative Names Card for REJECT/NO-GO verdicts
export const AlternativeNamesCard = ({ alternatives, verdict }) => {
    if (!alternatives || !['REJECT', 'NO-GO'].includes(verdict?.toUpperCase())) return null;

    return (
        <Card className={`${CARD_STYLE} ring-2 ring-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50`}>
            <CardHeader className="bg-amber-500 text-white p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-5 h-5 text-amber-100" />
                    <CardTitle className="text-lg font-bold tracking-tight">Plan B: Alternative Names</CardTitle>
                </div>
                <p className="text-amber-100 text-sm font-medium">Since the original name faces conflicts, consider these alternatives</p>
            </CardHeader>
            
            <CardContent className="p-6">
                {/* Poison Words Warning */}
                {alternatives.poison_words && alternatives.poison_words.length > 0 && (
                    <div className="mb-4 p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Poison Words to Avoid: </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {alternatives.poison_words.map((word, i) => (
                                    <Badge key={i} className="bg-rose-100 text-rose-700 border border-rose-300 font-bold">
                                        {word}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reasoning */}
                <div className="mb-6 p-4 bg-white rounded-xl border border-amber-200">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                        "{alternatives.reasoning}"
                    </p>
                </div>

                {/* Alternative Suggestions */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Suggested Alternatives (Poison-Word Free)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {alternatives.suggestions.map((alt, i) => (
                            <div 
                                key={i} 
                                className="p-4 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <h5 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition-colors">
                                        {alt.name}
                                    </h5>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {alt.rationale}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-6 p-4 bg-amber-100 rounded-xl border border-amber-200 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        Run a new analysis with any of these alternatives to get a full evaluation report.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// Platform icon mapping
const PlatformIcon = ({ platform, className }) => {
    const iconMap = {
        instagram: Instagram,
        twitter: Twitter,
        facebook: Facebook,
        youtube: Youtube,
        linkedin: Linkedin,
    };
    const Icon = iconMap[platform?.toLowerCase()] || Globe;
    return <Icon className={className} />;
};

// Status icon helper
const StatusIcon = ({ available }) => {
    if (available === true) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (available === false) return <XCircle className="w-4 h-4 text-rose-500" />;
    return <HelpCircle className="w-4 h-4 text-slate-400" />;
};

// Multi-Domain Availability Card
export const MultiDomainCard = ({ data }) => {
    if (!data) return null;

    const allDomains = [
        ...(data.category_domains || []),
        ...(data.country_domains || [])
    ];

    const availableCount = allDomains.filter(d => d.available === true).length;
    const totalCount = allDomains.length;

    return (
        <Card className={`${CARD_STYLE} h-full`}>
            <CardHeader className="pb-3 pt-5 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Multi-Domain Check
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white text-blue-700 font-bold">
                        {availableCount}/{totalCount} Available
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Category Domains */}
                {data.category_domains && data.category_domains.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Category TLDs</h4>
                        <div className="space-y-1">
                            {data.category_domains.map((d, i) => (
                                <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${d.available ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                                    <span className="text-sm font-bold text-slate-700">{d.domain}</span>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon available={d.available} />
                                        <Badge variant="outline" className={`text-[10px] ${d.available ? 'text-emerald-600 border-emerald-300' : 'text-rose-600 border-rose-300'}`}>
                                            {d.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Country Domains */}
                {data.country_domains && data.country_domains.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Country TLDs</h4>
                        <div className="space-y-1">
                            {data.country_domains.map((d, i) => (
                                <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${d.available ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                                    <span className="text-sm font-bold text-slate-700">{d.domain}</span>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon available={d.available} />
                                        <Badge variant="outline" className={`text-[10px] ${d.available ? 'text-emerald-600 border-emerald-300' : 'text-rose-600 border-rose-300'}`}>
                                            {d.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                {data.recommended_domain && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-700 mb-1">Recommended Domain</h4>
                        <p className="text-sm font-bold text-blue-900">{data.recommended_domain}</p>
                    </div>
                )}

                {data.acquisition_strategy && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-600 leading-relaxed">{data.acquisition_strategy}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Social Handle Availability Card
export const SocialAvailabilityCard = ({ data }) => {
    if (!data) return null;

    const platforms = data.platforms || [];
    const availableCount = platforms.filter(p => p.available === true).length;
    const totalCount = platforms.length;

    return (
        <Card className={`${CARD_STYLE} h-full`}>
            <CardHeader className="pb-3 pt-5 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-pink-600 flex items-center gap-2">
                        <Instagram className="w-4 h-4" /> Social Handles
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white text-pink-700 font-bold">
                        {availableCount}/{totalCount} Available
                    </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">Handle: <span className="font-bold text-slate-700">@{data.handle}</span></p>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
                {/* Platforms Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {platforms.map((p, i) => (
                        <div 
                            key={i} 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                p.available === true 
                                    ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' 
                                    : p.available === false 
                                        ? 'bg-rose-50 border-rose-200 hover:border-rose-300'
                                        : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <PlatformIcon platform={p.platform} className={`w-5 h-5 ${
                                p.available === true ? 'text-emerald-600' : p.available === false ? 'text-rose-500' : 'text-slate-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 capitalize truncate">{p.platform}</p>
                                <p className={`text-[10px] font-medium ${
                                    p.available === true ? 'text-emerald-600' : p.available === false ? 'text-rose-500' : 'text-slate-400'
                                }`}>
                                    {p.status}
                                </p>
                            </div>
                            <StatusIcon available={p.available} />
                        </div>
                    ))}
                </div>

                {/* Quick Summary */}
                <div className="flex gap-2 pt-2">
                    {data.available_platforms && data.available_platforms.length > 0 && (
                        <div className="flex-1 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Available</p>
                            <p className="text-xs text-emerald-800 font-medium">{data.available_platforms.join(', ')}</p>
                        </div>
                    )}
                    {data.taken_platforms && data.taken_platforms.length > 0 && (
                        <div className="flex-1 p-2 bg-rose-50 rounded-lg border border-rose-100">
                            <p className="text-[10px] font-bold text-rose-600 uppercase">Taken</p>
                            <p className="text-xs text-rose-800 font-medium">{data.taken_platforms.join(', ')}</p>
                        </div>
                    )}
                </div>

                {/* Recommendation */}
                {data.recommendation && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-start gap-2">
                        <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-purple-800 leading-relaxed">{data.recommendation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export { VisibilityAnalysisCard } from './VisibilityComponent';
