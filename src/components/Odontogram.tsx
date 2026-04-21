/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

type ToothStatus = 'healthy' | 'caries' | 'missing' | 'filled' | 'impacted';

interface ToothProps {
  id: string;
  status: ToothStatus;
  onClick: (id: string) => void;
  key?: string | number;
}

const Tooth = ({ id, status, onClick, isMilk }: ToothProps & { isMilk?: boolean }) => {
  const getStatusColor = (s: ToothStatus) => {
    switch (s) {
      case 'caries': return 'fill-rose-500';
      case 'filled': return 'fill-blue-500';
      case 'missing': return 'fill-slate-200';
      case 'impacted': return 'fill-amber-500';
      default: return 'fill-emerald-500';
    }
  };

  const size = isMilk ? 20 : 24;

  return (
    <div 
      onClick={() => onClick(id)}
      className="flex flex-col items-center gap-1 cursor-pointer group"
    >
      <span className={clsx(
        "text-[9px] font-bold transition-colors",
        isMilk ? "text-amber-500" : "text-slate-400 group-hover:text-brand-600"
      )}>{id}</span>
      <svg width={size} height={size} viewBox="0 0 24 24" className="filter drop-shadow-sm">
        <path 
          d="M12 2C8 2 5 4 4 8C3 12 5 18 7 20C9 22 15 22 17 20C19 18 21 12 20 8C19 4 16 2 12 2Z" 
          className={clsx("transition-all duration-300 stroke-slate-300 stroke-2", getStatusColor(status))}
        />
        {status === 'caries' && <circle cx="12" cy="12" r="3" className="fill-white opacity-40 animate-pulse" />}
      </svg>
    </div>
  );
};

export const Odontogram = ({ 
  data, 
  onChange 
}: { 
  data: Record<string, ToothStatus>, 
  onChange: (id: string, status: ToothStatus) => void 
}) => {
  const adultTeethUpper = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const childTeethUpper = ['55','54','53','52','51','61','62','63','64','65'];
  
  const adultTeethLower = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
  const childTeethLower = ['85','84','83','82','81','71','72','73','74','75'];

  const cycleStatus = (current: ToothStatus): ToothStatus => {
    const sequence: ToothStatus[] = ['healthy', 'caries', 'filled', 'missing', 'impacted'];
    const idx = sequence.indexOf(current);
    return sequence[(idx + 1) % sequence.length];
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 overflow-x-auto">
      <div className="min-w-[700px] flex flex-col gap-6">
        {/* Upper Arch Adult */}
        <div className="flex justify-center items-center gap-1.5">
           {adultTeethUpper.map(id => (
             <Tooth 
               key={id} 
               id={id} 
               status={data[id] || 'healthy'} 
               onClick={(id) => onChange(id, cycleStatus(data[id] || 'healthy'))} 
             />
           ))}
        </div>

        {/* Upper Arch Child */}
        <div className="flex justify-center items-center gap-3">
           {childTeethUpper.map(id => (
             <Tooth 
               key={id} 
               id={id} 
               isMilk
               status={data[id] || 'healthy'} 
               onClick={(id) => onChange(id, cycleStatus(data[id] || 'healthy'))} 
             />
           ))}
        </div>

        {/* Midline */}
        <div className="border-t border-dashed border-slate-300 w-full relative my-2">
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 text-[9px] font-black text-slate-400 rounded-full border border-slate-200 uppercase tracking-widest">
             Midline
           </div>
        </div>

        {/* Lower Arch Child */}
        <div className="flex justify-center items-center gap-3">
           {childTeethLower.map(id => (
             <Tooth 
               key={id} 
               id={id} 
               isMilk
               status={data[id] || 'healthy'} 
               onClick={(id) => onChange(id, cycleStatus(data[id] || 'healthy'))} 
             />
           ))}
        </div>

        {/* Lower Arch Adult */}
        <div className="flex justify-center items-center gap-1.5">
           {adultTeethLower.map(id => (
             <Tooth 
               key={id} 
               id={id} 
               status={data[id] || 'healthy'} 
               onClick={(id) => onChange(id, cycleStatus(data[id] || 'healthy'))} 
             />
           ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
           {([
             { s: 'healthy', l: 'Sehat', c: 'bg-emerald-500' },
             { s: 'caries', l: 'Karies', c: 'bg-rose-500' },
             { s: 'filled', l: 'Tambalan', c: 'bg-blue-500' },
             { s: 'missing', l: 'Hilang', c: 'bg-slate-200' },
             { s: 'impacted', l: 'Impaksi', c: 'bg-amber-500' },
           ]).map(item => (
             <div key={item.s} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className={clsx("w-3 h-3 rounded-sm shadow-sm", item.c)} />
                {item.l}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
