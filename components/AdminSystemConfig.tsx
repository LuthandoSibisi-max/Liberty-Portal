
import React, { useState } from 'react';
import { MOCK_SYSTEM_CONFIG, MOCK_AUDIT_LOGS } from '../constants';
import { SystemSettings } from '../types';

export const AdminSystemConfig: React.FC = () => {
    const [config, setConfig] = useState<SystemSettings>(MOCK_SYSTEM_CONFIG);
    const [logs] = useState(MOCK_AUDIT_LOGS);
    const [isSaving, setIsSaving] = useState(false);

    const toggleAI = (key: keyof SystemSettings['aiModels']) => {
        setConfig(prev => ({
            ...prev,
            aiModels: { ...prev.aiModels, [key]: !prev.aiModels[key] }
        }));
    };

    const togglePlatform = (key: keyof SystemSettings['platform']) => {
        setConfig(prev => ({
            ...prev,
            platform: { ...prev.platform, [key]: !prev.platform[key] }
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <i className="fas fa-server text-indigo-500"></i> System Configuration
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage global infrastructure, AI models, and operational states.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                >
                    {isSaving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* AI Model Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Veo Control */}
                <div className="bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-purple-500/20 to-transparent w-20 h-20 rounded-bl-full"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                            <i className="fas fa-video"></i>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${config.aiModels.veoEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></div>
                    </div>
                    <h3 className="font-bold text-white text-lg">Video Generation (Veo)</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6 h-8">Enable `veo-3.1-fast-generate-preview`. High cost impact.</p>
                    <button 
                        onClick={() => toggleAI('veoEnabled')}
                        className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            config.aiModels.veoEnabled 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {config.aiModels.veoEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                {/* Text Control */}
                <div className="bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-blue-500/20 to-transparent w-20 h-20 rounded-bl-full"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                            <i className="fas fa-brain"></i>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                    <h3 className="font-bold text-white text-lg">Text Intelligence</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6 h-8">Active Model: <span className="font-mono text-blue-300">{config.aiModels.textModel}</span></p>
                    <button disabled className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-900/20 text-blue-400 cursor-not-allowed border border-blue-900/50">
                        System Locked
                    </button>
                </div>

                {/* Image Control */}
                <div className="bg-[#0B1120] p-6 rounded-2xl border border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-[1px] bg-gradient-to-bl from-pink-500/20 to-transparent w-20 h-20 rounded-bl-full"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-pink-900/30 flex items-center justify-center text-pink-400">
                            <i className="fas fa-image"></i>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${config.aiModels.imagenEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></div>
                    </div>
                    <h3 className="font-bold text-white text-lg">Image Generation</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-6 h-8">Enable `imagen-3.0`. Moderate cost impact.</p>
                    <button 
                        onClick={() => toggleAI('imagenEnabled')}
                        className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            config.aiModels.imagenEnabled 
                                ? 'bg-pink-600 text-white hover:bg-pink-700' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {config.aiModels.imagenEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            </div>

            {/* Platform Controls */}
            <div className="bg-[#0B1120] p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Platform Controls</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white text-sm">Public Registration</h4>
                            <p className="text-xs text-slate-400">Allow new users to sign up via landing page. Keep disabled for Enterprise B2B.</p>
                        </div>
                        <button 
                            onClick={() => togglePlatform('publicRegistration')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${config.platform.publicRegistration ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.platform.publicRegistration ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white text-sm">Maintenance Mode</h4>
                            <p className="text-xs text-slate-400">Lock access for all non-admin users. Use for database migrations.</p>
                        </div>
                        <button 
                            onClick={() => togglePlatform('maintenanceMode')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${config.platform.maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.platform.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white text-sm">Debug Logging</h4>
                            <p className="text-xs text-slate-400">Verbose logging for Gemini payloads. Increases storage usage.</p>
                        </div>
                        <button 
                            onClick={() => togglePlatform('debugLogging')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${config.platform.debugLogging ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.platform.debugLogging ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Log */}
            <div className="bg-[#0B1120] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">System Audit Log</h3>
                    <button className="text-xs text-indigo-400 hover:text-white font-bold uppercase tracking-wider">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-black/40 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Event</th>
                                <th className="p-4">Resource</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-slate-300">{log.timestamp}</td>
                                    <td className="p-4 text-white font-bold">{log.user}</td>
                                    <td className="p-4 text-indigo-300">{log.action}</td>
                                    <td className="p-4">{log.resource}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            log.status === 'Success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
