/**
 * StepCard — Reusable wrapper component for consistent card styling.
 * Provides: white card with rounded corners, shadow, title, subtitle, responsive padding.
 */
interface StepCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export default function StepCard({ title, subtitle, icon, children, className = "" }: StepCardProps) {
  return (
    <div className={`w-full max-w-lg mx-auto px-4 py-6 animate-fadeIn ${className}`}>
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start space-x-3">
            {icon && (
              <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Card Body */}
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
