import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Key, Users, Zap, Copy, Check, Loader2, RefreshCw,
  ShoppingCart, UserPlus, Search, Image,
} from 'lucide-react';
import { adminApi } from '../services/api';

const PLANS = [
  { id: 'starter', name: '基础包', credits: 50, label: '¥9.9 - 50积分' },
  { id: 'pro', name: '进阶包', credits: 200, label: '¥29.9 - 200积分' },
  { id: 'enterprise', name: '专业包', credits: 500, label: '¥59.9 - 500积分' },
];

// ====== 剪贴板工具（兼容 HTTP） ======
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // HTTP 环境 fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch {
      ta.remove();
      return false;
    }
  }
}

export const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<'keys' | 'users' | 'logs' | 'images' | 'orders'>('keys');
  const [keys, setKeys] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genPlan, setGenPlan] = useState('starter');
  const [genResult, setGenResult] = useState<any[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // 针对某个用户发卡
  const [keyUser, setKeyUser] = useState<string | null>(null);
  const [keyUserName, setKeyUserName] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'keys') {
        const { keys: keyList } = await adminApi.getKeys();
        setKeys(keyList);
      } else if (tab === 'users') {
        const { users: userList } = await adminApi.getUsers();
        setUsers(userList);
      } else if (tab === 'logs') {
        const { logs: logList } = await adminApi.getPurchaseLogs();
        setLogs(logList);
      } else if (tab === 'images') {
        const { images: imageList } = await adminApi.getImages();
        setImages(imageList);
      } else if (tab === 'orders') {
        const { orders: orderList } = await adminApi.getOrders();
        setOrders(orderList);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 通用生成卡密
  const handleGenerate = async (targetUserId?: string) => {
    const plan = PLANS.find((p) => p.id === genPlan);
    if (!plan) return;
    setGenerating(true);
    if (!targetUserId) setGenResult(null);
    try {
      const { keys: newKeys } = await adminApi.generateKeys(
        genCount, plan.credits, genPlan, targetUserId
      );
      if (targetUserId) {
        // 给特定用户发卡成功后刷新用户列表
        alert(`已为 ${keyUserName} 生成 ${newKeys.length} 个卡密`);
        setKeyUser(null);
        loadData();
      } else {
        setGenResult(newKeys);
        setKeys([...newKeys, ...keys]);
      }
    } catch (err: any) {
      alert(err.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code: string) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } else {
      alert('复制失败，请手动复制');
    }
  };

  const handleCopyAll = async (keyList: any[]) => {
    const text = keyList.map((k: any) => k.code).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } else {
      alert('复制失败，请手动复制');
    }
  };

  const TabButton = ({ id, label, icon }: { id: typeof tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex shrink-0 items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
        tab === id ? 'bg-stone-900 text-neon' : 'text-stone-400 hover:bg-stone-50'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-impact uppercase italic text-stone-900">管理员面板</h1>
          <p className="text-stone-400 mt-2 font-medium">卡密管理 · 用户管理 · 购买日志</p>
        </div>

        {/* 标签页 */}
        <div className="flex gap-3 sm:gap-4 mb-10 border-b border-stone-100 pb-4 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabButton id="keys" label="卡密管理" icon={<Key className="w-4 h-4" />} />
          <TabButton id="users" label="用户列表" icon={<Users className="w-4 h-4" />} />
          <TabButton id="images" label="图片管理" icon={<Image className="w-4 h-4" />} />
          <TabButton id="orders" label="订单管理" icon={<ShoppingCart className="w-4 h-4" />} />
          <TabButton id="logs" label="购买日志" icon={<Zap className="w-4 h-4" />} />
        </div>

        {/* ================================================================ */}
        {/* 标签 1：卡密管理                                                       */}
        {/* ================================================================ */}
        {tab === 'keys' && (
          <div>
            {/* 生成卡密区域 */}
            <div className="bg-stone-50 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 mb-10 border border-stone-100">
              <h2 className="text-2xl font-impact uppercase italic mb-6">生成卡密</h2>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-5 sm:gap-6">
                <div className="w-full sm:w-auto">
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em]">套餐类型</label>
                  <select
                    value={genPlan}
                    onChange={(e) => setGenPlan(e.target.value)}
                    className="w-full sm:w-[200px] px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold"
                  >
                    {PLANS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-auto">
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em]">生成数量</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full sm:w-[120px] px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold"
                  />
                </div>
                <button
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  className="w-full sm:w-auto justify-center px-8 py-3 bg-stone-900 text-neon rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {generating ? '生成中...' : '生成卡密'}
                </button>
                <button onClick={loadData} className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-100 transition-all">
                  <RefreshCw className="w-4 h-4 text-stone-400" />
                </button>
              </div>

              {/* 生成结果 */}
              {genResult && genResult.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-neon/10 border border-neon/30 rounded-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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

            {/* 卡密列表 */}
            <div>
              <h2 className="text-2xl font-impact uppercase italic mb-6">卡密列表</h2>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
              ) : (
                <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-x-auto">
                  <div className="min-w-[760px] grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                    <div className="col-span-4">卡密</div>
                    <div className="col-span-2">套餐</div>
                    <div className="col-span-1">积分</div>
                    <div className="col-span-2">发放对象</div>
                    <div className="col-span-3">状态</div>
                  </div>
                  {keys.map((k: any) => (
                    <div key={k.id} className="min-w-[760px] grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                      <div className="col-span-4 flex items-center gap-2">
                        <code className="text-xs font-mono text-stone-700 select-all truncate">{k.code}</code>
                        <button
                          onClick={() => handleCopy(k.code)}
                          className="p-1 hover:bg-stone-200 rounded transition-colors shrink-0"
                        >
                          {copied === k.code ? <Check className="w-3 h-3 text-neon" /> : <Copy className="w-3 h-3 text-stone-400" />}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded">{k.plan}</span>
                      </div>
                      <div className="col-span-1 font-bold">{k.credits}</div>
                      <div className="col-span-2 text-xs text-stone-500 truncate">
                        {k.targetUser ? k.targetUser.email : (k.targetUserId ? '已删除用户' : '-')}
                      </div>
                      <div className="col-span-3">
                        {k.used ? (
                          <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">
                            已使用 {k.usedBy ? '(已兑换)' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">可用</span>
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

        {/* ================================================================ */}
        {/* 标签 2：用户列表（每行可发卡密）                                         */}
        {/* ================================================================ */}
        {tab === 'users' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-x-auto">
                <div className="min-w-[860px] grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                  <div className="col-span-2">用户</div>
                  <div className="col-span-3">邮箱</div>
                  <div className="col-span-1">角色</div>
                  <div className="col-span-1">积分</div>
                  <div className="col-span-1">购买次数</div>
                  <div className="col-span-2">注册时间</div>
                  <div className="col-span-2">操作</div>
                </div>

                {/* 行内发卡弹窗 */}
                {keyUser && (
                  <div className="p-6 bg-white border-b border-stone-200 mx-4 my-2 rounded-2xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:flex-wrap">
                      <span className="text-sm font-bold text-stone-700">
                        为 {keyUserName} 发放卡密：
                      </span>
                      <select
                        value={genPlan}
                        onChange={(e) => setGenPlan(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                      >
                        {PLANS.map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={genCount}
                        onChange={(e) => setGenCount(Number(e.target.value))}
                        className="w-full sm:w-[80px] px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold"
                      />
                      <span className="text-xs text-stone-400">个</span>
                      <button
                        onClick={() => handleGenerate(keyUser)}
                        disabled={generating}
                        className="w-full sm:w-auto justify-center px-5 py-2 bg-stone-900 text-neon rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        确认发放
                      </button>
                      <button
                        onClick={() => setKeyUser(null)}
                        className="px-4 py-2 text-xs text-stone-400 hover:text-stone-900"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {users.map((u: any) => (
                  <div key={u.id} className="min-w-[860px] grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                    <div className="col-span-2 font-bold truncate">{u.name || '未命名'}</div>
                    <div className="col-span-3 text-stone-500 text-xs truncate">{u.email}</div>
                    <div className="col-span-1">
                      {u.role === 'ADMIN' ? (
                        <span className="text-xs font-bold bg-stone-900 text-neon px-2 py-0.5 rounded">管理员</span>
                      ) : (
                        <span className="text-xs text-stone-400">用户</span>
                      )}
                    </div>
                    <div className="col-span-1 font-mono font-bold">{u.credits}</div>
                    <div className="col-span-1 text-xs text-stone-500">
                      <span className="font-bold">{u.orderCount || 0}</span>
                      <span className="text-stone-300">次</span>
                    </div>
                    <div className="col-span-2 text-xs text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="col-span-2">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => { setKeyUser(u.id); setKeyUserName(u.name || u.email); setGenCount(1); }}
                          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-900 hover:text-neon rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          发卡密
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 标签 3：图片管理                                                       */}
        {/* ================================================================ */}
        {tab === 'images' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-x-auto">
                <div className="min-w-[960px] grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">用户</div>
                  <div className="col-span-4">提示词</div>
                  <div className="col-span-3">图片</div>
                  <div className="col-span-2">创建时间</div>
                </div>
                {images.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 font-medium">暂无图片</div>
                ) : (
                  images.map((img: any) => (
                    <div key={img.id} className="min-w-[960px] grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                      <div className="col-span-1 text-xs text-stone-400 font-mono truncate">{img.id.slice(0, 8)}</div>
                      <div className="col-span-2 text-xs truncate">{img.user?.name || img.user?.email || '-'}</div>
                      <div className="col-span-4 text-xs text-stone-600 truncate">{img.prompt}</div>
                      <div className="col-span-3">
                        <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                          {img.url.split('/').pop()}
                        </a>
                      </div>
                      <div className="col-span-2 text-xs text-stone-400">
                        {new Date(img.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 标签 4：订单管理                                                       */}
        {/* ================================================================ */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-x-auto">
                <div className="min-w-[960px] grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                  <div className="col-span-2">订单号</div>
                  <div className="col-span-2">用户</div>
                  <div className="col-span-2">套餐</div>
                  <div className="col-span-1">金额</div>
                  <div className="col-span-1">积分</div>
                  <div className="col-span-2">状态</div>
                  <div className="col-span-2">时间</div>
                </div>
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 font-medium">暂无订单</div>
                ) : (
                  orders.map((o: any) => (
                    <div key={o.id} className="min-w-[960px] grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                      <div className="col-span-2 text-xs font-mono text-stone-500 truncate">{o.orderNo}</div>
                      <div className="col-span-2 text-xs truncate">{o.user?.name || o.user?.email || '-'}</div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded">{o.plan}</span>
                      </div>
                      <div className="col-span-1 font-mono text-xs">¥{(o.amount / 100).toFixed(1)}</div>
                      <div className="col-span-1 font-mono text-xs">{o.credits}</div>
                      <div className="col-span-2">
                        {o.status === 'COMPLETED' ? (
                          <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">已完成</span>
                        ) : o.status === 'REFUNDED' ? (
                          <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">已退款</span>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">待支付</span>
                        )}
                      </div>
                      <div className="col-span-2 text-xs text-stone-400">
                        {new Date(o.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 标签 5：购买日志                                                       */}
        {/* ================================================================ */}
        {tab === 'logs' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 overflow-x-auto">
                <div className="min-w-[780px] grid grid-cols-12 gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                  <div className="col-span-2">用户</div>
                  <div className="col-span-3">邮箱</div>
                  <div className="col-span-2">套餐</div>
                  <div className="col-span-1">金额</div>
                  <div className="col-span-2">状态</div>
                  <div className="col-span-2">时间</div>
                </div>
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 font-medium">暂无购买记录</div>
                ) : (
                  logs.map((log: any) => (
                    <div key={log.id} className="min-w-[780px] grid grid-cols-12 gap-4 p-4 border-b border-stone-50 text-sm items-center">
                      <div className="col-span-2 font-bold truncate text-xs">{log.userName || '用户'}</div>
                      <div className="col-span-3 text-stone-500 text-xs truncate">{log.userEmail}</div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded">{log.plan}</span>
                      </div>
                      <div className="col-span-1 font-mono text-xs">
                        ¥{(log.amount / 100).toFixed(1)}
                      </div>
                      <div className="col-span-2">
                        {log.status === 'COMPLETED' ? (
                          <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">已完成</span>
                        ) : log.status === 'FAILED' ? (
                          <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded">失败</span>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded">待支付</span>
                        )}
                      </div>
                      <div className="col-span-2 text-xs text-stone-400">
                        {new Date(log.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={loadData}
                className="text-xs text-stone-400 hover:text-stone-900 flex items-center gap-1 ml-auto"
              >
                <RefreshCw className="w-3 h-3" /> 刷新
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
