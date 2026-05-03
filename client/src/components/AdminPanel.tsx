import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, Users, Zap, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';

const PLANS = [
  { id: 'starter', name: '基础包', credits: 50, label: '¥9.9 - 50积分' },
  { id: 'pro', name: '进阶包', credits: 200, label: '¥29.9 - 200积分' },
  { id: 'enterprise', name: '专业包', credits: 500, label: '¥59.9 - 500积分' },
];

export const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<'keys' | 'users'>('keys');
  const [keys, setKeys] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genPlan, setGenPlan] = useState('starter');
  const [genResult, setGenResult] = useState<any[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'keys') {
        const { keys: keyList } = await adminApi.getKeys();
        setKeys(keyList);
      } else {
        const { users: userList } = await adminApi.getUsers();
        setUsers(userList);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const plan = PLANS.find((p) => p.id === genPlan);
    if (!plan) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const { keys: newKeys } = await adminApi.generateKeys(genCount, plan.credits, genPlan);
      setGenResult(newKeys);
      setKeys([...newKeys, ...keys]);
    } catch (err: any) {
      alert(err.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async (keyList: any[]) => {
    const text = keyList.map((k: any) => k.code).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-12">
          <h1 className="text-6xl font-impact uppercase italic text-stone-900">管理员面板</h1>
          <p className="text-stone-400 mt-2 font-medium">卡密管理 · 用户管理</p>
        </div>

        <div className="flex gap-4 mb-10 border-b border-stone-100 pb-4">
          {[
            { id: 'keys' as const, label: '卡密管理', icon: <Key className="w-4 h-4" /> },
            { id: 'users' as const, label: '用户列表', icon: <Users className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                tab === t.id ? 'bg-stone-900 text-neon' : 'text-stone-400 hover:bg-stone-50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'keys' && (
          <div>
            <div className="bg-stone-50 rounded-[3rem] p-10 mb-10 border border-stone-100">
              <h2 className="text-2xl font-impact uppercase italic mb-6">生成卡密</h2>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em]">套餐类型</label>
                  <select
                    value={genPlan}
                    onChange={(e) => setGenPlan(e.target.value)}
                    className="w-[200px] px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold"
                  >
                    {PLANS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em]">生成数量</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-[120px] px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-8 py-3 bg-stone-900 text-neon rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {generating ? '生成中...' : '生成卡密'}
                </button>
                <button onClick={loadData} className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-100 transition-all">
                  <RefreshCw className="w-4 h-4 text-stone-400" />
                </button>
              </div>

              {genResult && genResult.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-neon/10 border border-neon/30 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black text-stone-900">已生成 {genResult.length} 个卡密</span>
                    <button
                      onClick={() => handleCopyAll(genResult)}
                      className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                    >
                      {copied === 'all' ? <Check className="w-3 h-3 text-neon" /> : <Copy className="w-3 h-3" />}
                      一键复制全部
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {genResult.map((k: any) => (
                      <div
                        key={k.id}
                        onClick={() => handleCopy(k.code)}
                        className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 cursor-pointer hover:border-stone-400 transition-all group"
                      >
                        <code className="text-sm font-mono text-stone-700 select-all">{k.code}</code>
                        <span className="text-xs text-stone-400 font-bold">{k.credits}积分</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-impact uppercase italic mb-6">卡密列表</h2>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
              ) : (
                <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                    <div className="col-span-5">卡密</div>
                    <div className="col-span-2">套餐</div>
                    <div className="col-span-2">积分</div>
                    <div className="col-span-3">状态</div>
                  </div>
                  {keys.map((k: any) => (
                    <div key={k.id} className="grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                      <div className="col-span-5">
                        <code className="text-xs font-mono text-stone-700">{k.code}</code>
                        <button
                          onClick={() => handleCopy(k.code)}
                          className="ml-2 p-1 hover:bg-stone-200 rounded transition-colors inline-flex"
                        >
                          {copied === k.code ? <Check className="w-3 h-3 text-neon" /> : <Copy className="w-3 h-3 text-stone-400" />}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded">{k.plan}</span>
                      </div>
                      <div className="col-span-2 font-bold">{k.credits}</div>
                      <div className="col-span-3">
                        {k.used ? (
                          <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">已使用</span>
                        ) : (
                          <span className="text-xs text-neon font-bold bg-neon/10 px-2 py-0.5 rounded">可用</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {keys.length === 0 && (
                    <div className="p-12 text-center text-stone-400 font-medium">暂无卡密</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                  <div className="col-span-2">用户</div>
                  <div className="col-span-3">邮箱</div>
                  <div className="col-span-2">角色</div>
                  <div className="col-span-2">积分</div>
                  <div className="col-span-3">注册时间</div>
                </div>
                {users.map((u: any) => (
                  <div key={u.id} className="grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                    <div className="col-span-2 font-bold truncate">{u.name || '未命名'}</div>
                    <div className="col-span-3 text-stone-500 text-xs truncate">{u.email}</div>
                    <div className="col-span-2">
                      {u.role === 'ADMIN' ? (
                        <span className="text-xs font-bold bg-stone-900 text-neon px-2 py-0.5 rounded">管理员</span>
                      ) : (
                        <span className="text-xs text-stone-400">用户</span>
                      )}
                    </div>
                    <div className="col-span-2 font-mono font-bold">{u.credits}</div>
                    <div className="col-span-3 text-xs text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
