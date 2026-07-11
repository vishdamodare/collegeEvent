"use client";

import { motion } from "framer-motion";

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8 relative">
      {/* Background Track */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -z-10 -translate-y-1/2 rounded-full"></div>
      
      {/* Active Track */}
      <motion.div 
        className="absolute top-1/2 left-0 h-[2px] bg-[var(--color-lime)] -z-10 -translate-y-1/2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        
        return (
          <div key={step} className="flex flex-col items-center gap-2">
            <motion.div 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors duration-300 ${
                isActive 
                  ? "bg-[var(--color-lime)] border-[var(--color-lime)] text-black" 
                  : isCompleted 
                    ? "bg-[var(--color-lime)] border-[var(--color-lime)] text-black"
                    : "bg-[#141414] border-[#2A2A2A] text-[#555]"
              }`}
              initial={false}
              animate={{
                scale: isActive ? 1.2 : 1,
              }}
            >
              {isCompleted ? "✓" : idx + 1}
            </motion.div>
            <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block absolute top-8 transition-colors ${
              isActive || isCompleted ? "text-white" : "text-[#555]"
            }`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
