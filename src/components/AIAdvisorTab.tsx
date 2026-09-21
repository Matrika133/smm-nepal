import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  Target,
  Send,
  Loader2,
  Copy,
  Check,
  Hash,
  Flame,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { ServiceCategory } from '../types';

export function AIAdvisorTab() {
  const [activeSubTab, setActiveSubTab] = useState<'strategy' | 'hooks'>('strategy');

  // Strategy form states
  const [platform, setPlatform] = useState<ServiceCategory>('Instagram');
  const [goal, setGoal] = useState('Boost viral engagement, reach explore feed, and gain 10k active followers');
  const [currentFollowers, setCurrentFollowers] = useState('2,500');
  const [targetAudience, setTargetAudience] = useState('Travel, Lifestyle, and Tech Creators in Nepal & South Asia');
  const [budget, setBudget] = useState('2500');

  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [strategyResult, setStrategyResult] = useState('');

  // Hook generator states
  const [hookPlatform, setHookPlatform] = useState('TikTok & Instagram Reels');
  const [hookTopic, setHookTopic] = useState('Best secret travel spots in Pokhara & Everest Nepal 2026');
  const [hookTone, setHookTone] = useState('High Energy & Viral Curiosity Hook');
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [hooksResult, setHooksResult] = useState('');

  const [copiedStrategy, setCopiedStrategy] = useState(false);
  const [copiedHooks, setCopiedHooks] = useState(false);

  // Generate strategy
  const handleGenerateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStrategy(true);
    setStrategyResult('');

    try {
      const res = await fetch('/api/ai/growth-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          goal,
          currentFollowers,
          targetAudience,
          budget,
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setStrategyResult(data.advice);
      } else {
        setStrategyResult('Unable to generate strategy. Please verify your connection.');
      }
    } catch (err: any) {
      setStrategyResult(`Error: ${err.message || 'Server failed to respond'}`);
    } finally {
      setLoadingStrategy(false);
    }
  };

  // Generate hooks & captions
  const handleGenerateHooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHooks(true);
    setHooksResult('');

    try {
      const res = await fetch('/api/ai/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: hookPlatform,
          topic: hookTopic,
          tone: hookTone,
        }),
      });

      const data = await res.json();
      if (data.output) {
        setHooksResult(data.output);
      } else {
        setHooksResult('Could not generate viral hooks at this time.');
      }
    } catch (err: any) {
      setHooksResult(`Error: ${err.message || 'Failed to connect to AI server'}`);
    } finally {
      setLoadingHooks(false);
    }
  };

  const copyText = (text: string, isStrategy: boolean) => {
    navigator.clipboard.writeText(text);
    if (isStrategy) {
      setCopiedStrategy(true);
      setTimeout(() => setCopiedStrategy(false), 2000);
    } else {
      setCopiedHooks(true);
      setTimeout(() => setCopiedHooks(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Switcher */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Gemini SMM Growth Strategist
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Get data-backed social media growth blueprints, viral hook scripts, and panel allocation plans.
            </p>
          </div>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('strategy')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'strategy'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Growth Blueprint</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hooks')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'hooks'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Viral Hooks & Captions</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Strategy Advisor */}
      {activeSubTab === 'strategy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Campaign Parameters
            </h3>

            <form onSubmit={handleGenerateStrategy} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Target Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ServiceCategory)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Instagram">Instagram (Reels + Feed)</option>
                  <option value="TikTok">TikTok (FYP Algorithm)</option>
                  <option value="YouTube">YouTube (Subscribers & WatchTime)</option>
                  <option value="Facebook">Facebook (Pages & Viral Videos)</option>
                  <option value="Telegram">Telegram (Channel Expansion)</option>
                  <option value="X (Twitter)">X / Twitter (Trending Hashtags)</option>
                  <option value="Spotify">Spotify (Streams & Algorithm)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Current Audience Size</label>
                <input
                  type="text"
                  value={currentFollowers}
                  onChange={(e) => setCurrentFollowers(e.target.value)}
                  placeholder="e.g. 1,500 followers"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Target Niche & Content Type</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. E-commerce brand in Kathmandu"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Primary Growth Goal</label>
                <textarea
                  rows={2}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What is your main objective?"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Estimated Budget (Rs. NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-[11px]">Rs.</span>
                  <input
                    type="number"
                    min={500}
                    max={500000}
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingStrategy}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingStrategy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Viral Algorithms...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI SMM Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Strategy Output */}
          <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" /> Strategic SMM Recommendation
                </span>
                {strategyResult && (
                  <button
                    onClick={() => copyText(strategyResult, true)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedStrategy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStrategy ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {strategyResult ? (
                <div className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[480px] overflow-y-auto pr-2 space-y-2">
                  {strategyResult}
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500 space-y-2">
                  <Lightbulb className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">
                    Configure your platform parameters on the left and click <strong>Generate AI SMM Plan</strong> to receive a tailored allocation blueprint.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Viral Hooks & Captions */}
      {activeSubTab === 'hooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Content Hook Generator
            </h3>

            <form onSubmit={handleGenerateHooks} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Target Format</label>
                <select
                  value={hookPlatform}
                  onChange={(e) => setHookPlatform(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TikTok & Instagram Reels (Short-form Video)">TikTok & Instagram Reels (Short-form Video)</option>
                  <option value="YouTube Shorts & Long Video Titles">YouTube Shorts & Video Titles</option>
                  <option value="X (Twitter) Viral Thread Hooks">X / Twitter Viral Thread Hooks</option>
                  <option value="Facebook Viral Post Copy">Facebook Viral Post Copy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Topic / Product / Story</label>
                <textarea
                  rows={3}
                  value={hookTopic}
                  onChange={(e) => setHookTopic(e.target.value)}
                  placeholder="e.g. How we scaled our online momo business to $10k/month"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Tone & Angle</label>
                <select
                  value={hookTone}
                  onChange={(e) => setHookTone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="High Energy & Viral Curiosity Hook">High Energy & Viral Curiosity Hook</option>
                  <option value="Controversial & Pattern-Interrupt">Controversial & Pattern-Interrupt</option>
                  <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                  <option value="Humorous & Relatable Nepali Meme Style">Humorous & Relatable Meme Style</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingHooks}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingHooks ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Viral Scripts...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Generate Viral Hooks & Hashtags</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-400" /> Ready-to-Post Viral Copy
                </span>
                {hooksResult && (
                  <button
                    onClick={() => copyText(hooksResult, false)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHooks ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHooks ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {hooksResult ? (
                <div className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[480px] overflow-y-auto pr-2 space-y-2">
                  {hooksResult}
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">
                    Input your video topic on the left to get high-CTR retention hooks and high-reach hashtags.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
