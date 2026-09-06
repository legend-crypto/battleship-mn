import React from 'react';
import { Cpu, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProofGenerationOverlayProps {
  isOpen: boolean;
  step: 'WITNESS' | 'SNARK_PROOF' | 'VERIFY_ROOT' | 'COMPLETE';
  message?: string;
}

export const ProofGenerationOverlay: React.FC<ProofGenerationOverlayProps> = ({
  isOpen,
  step,
  message = 'Computing Zero-Knowledge Proof...'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
      <div className="bg-[#091015] border border-emerald-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Animated Icon Header */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>MIDNIGHT ZK PROOF COMPUTATION</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Client-side ZK-SNARK witness generation in progress...
          </p>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="p-4 bg-[#050B0E] border border-slate-800 rounded-2xl text-left space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-bold">
              {step === 'WITNESS' ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>1. Constructing 100-cell Merkle witness</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {step === 'WITNESS' ? 'COMPUTING' : 'DONE'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-bold">
              {step === 'SNARK_PROOF' ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : step === 'VERIFY_ROOT' || step === 'COMPLETE' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-700 block"></span>
              )}
              <span>2. Generating ZK-SNARK proof</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {step === 'SNARK_PROOF' ? 'PROVING' : step === 'VERIFY_ROOT' || step === 'COMPLETE' ? 'DONE' : 'WAITING'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300 font-bold">
              {step === 'VERIFY_ROOT' ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : step === 'COMPLETE' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-700 block"></span>
              )}
              <span>3. Verifying commitment on NIGHT ledger</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {step === 'VERIFY_ROOT' ? 'VERIFYING' : step === 'COMPLETE' ? 'DONE' : 'WAITING'}
            </span>
          </div>
        </div>

        {/* Custom Status Message */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] rounded-xl flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};
