import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Calendar, Clock, User, Tag, BookOpen, TrendingUp, Lightbulb, Scale, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from '../components/Footer';

const BlogPage = () => {
  const featuredPost = {
    title: "The Complete Guide to Brand Name Evaluation in 2025",
    excerpt: "Learn how AI is revolutionizing the way startups and enterprises evaluate brand names. From trademark searches to cultural analysis, discover the modern approach to brand naming.",
    category: "Brand Strategy",
    readTime: "8 min read",
    date: "July 2025",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
    slug: "#"
  };

  const blogPosts = [
    {
      title: "5 Trademark Mistakes That Could Cost Your Startup Millions",
      excerpt: "Avoid these common trademark pitfalls that sink promising startups. Real case studies and how to protect your brand from day one.",
      category: "Legal",
      readTime: "5 min read",
      date: "July 2025",
      icon: Scale,
      color: "bg-red-500"
    },
    {
      title: "How to Check Domain Availability Like a Pro",
      excerpt: "Beyond .com: Modern domain strategies for 2025. Category TLDs, country codes, and when to buy premium domains.",
      category: "Digital Strategy",
      readTime: "4 min read",
      date: "July 2025",
      icon: Globe,
      color: "bg-blue-500"
    },
    {
      title: "The Psychology of Memorable Brand Names",
      excerpt: "What makes Nike, Apple, and Spotify stick in our minds? The science behind phonetic patterns and brand recall.",
      category: "Brand Psychology",
      readTime: "6 min read",
      date: "July 2025",
      icon: Lightbulb,
      color: "bg-amber-500"
    },
    {
      title: "International Brand Naming: Cultural Pitfalls to Avoid",
      excerpt: "From Chevy Nova to KFC in China - learn from famous brand naming failures and how to test names across cultures.",
      category: "Global Strategy",
      readTime: "7 min read",
      date: "July 2025",
      icon: TrendingUp,
      color: "bg-emerald-500"
    },
  ];

  const categories = [
    { name: "Brand Strategy", count: 12 },
    { name: "Legal", count: 8 },
    { name: "Digital Strategy", count: 6 },
    { name: "Case Studies", count: 10 },
    { name: "Global Strategy", count: 5 },
  ];

  return (
    <>
      <Helmet>
        <title>Blog | RIGHTNAME - Brand Naming Insights & Strategies</title>
        <meta name="description" content="Expert insights on brand naming, trademark protection, domain strategy, and building memorable brands. Learn from real case studies and industry best practices." />
        <meta property="og:title" content="Blog | RIGHTNAME" />
        <meta property="og:description" content="Expert insights on brand naming, trademark protection, and building memorable brands." />
        <link rel="canonical" href="https://rightname.ai/blog" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="https://customer-assets.emergentagent.com/job_name-radar-1/artifacts/a4ppykdi_RIGHTNAME.AI.png" 
                  alt="RIGHTNAME Logo" 
                  className="w-10 h-10 rounded-xl"
                />
                <span className="font-black text-xl text-slate-900">RIGHTNAME</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
                <Link to="/pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
                <Link to="/blog" className="text-sm font-semibold text-blue-600">Blog</Link>
              </nav>
              <Link to="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6">
                  Try Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 font-bold px-4 py-1">
                <BookOpen className="w-3 h-3 mr-1" /> Brand Insights
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                The RIGHTNAME{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                  Blog
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Expert insights on brand naming, trademark strategy, and building memorable brands that last.
              </p>
            </div>

            {/* Featured Post */}
            <Card className="overflow-hidden border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl mb-12">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <CardContent className="md:w-1/2 p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-violet-100 text-violet-700 border-violet-200 font-bold">
                    Featured
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-600 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" /> {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {featuredPost.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {featuredPost.date}
                    </span>
                  </div>
                  <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6">
                    Read Article <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Posts */}
              <div className="lg:w-2/3">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Latest Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {blogPosts.map((post, index) => (
                    <Card 
                      key={index} 
                      className="border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 ${post.color} rounded-xl flex items-center justify-center mb-4`}>
                          <post.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="mb-3 bg-slate-100 text-slate-600 border-slate-200 text-xs">
                          {post.category}
                        </Badge>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl border-2 border-dashed border-blue-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">More Content Coming Soon!</h3>
                  <p className="text-slate-600">
                    We're working on in-depth guides, case studies, and expert interviews. Check back soon!
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-1/3">
                {/* Categories */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-8">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((cat, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <span className="text-slate-700 font-medium">{cat.name}</span>
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                          {cat.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Get the latest brand naming insights delivered to your inbox.
                  </p>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl text-slate-900 mb-3 text-sm"
                  />
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl">
                    Subscribe
                  </Button>
                </div>

                {/* CTA Card */}
                <div className="mt-8 bg-white rounded-2xl border-2 border-slate-200 p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Ready to Evaluate Your Brand?</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Get a consulting-grade brand name analysis in 60 seconds.
                  </p>
                  <Link to="/">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                      Try Free <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;
