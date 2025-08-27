import { cn } from "@/lib/utils"

interface StepProps {
  title: string
  description?: string
  number: number
}

const Step: React.FC<StepProps> = ({ title, description, number }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center border-primary bg-primary text-primary-foreground"
          )}
        >
          <span className="text-lg font-medium text-foreground">{number}</span>
        </div>
      </div>
      <div className="ml-4">
        <p className={cn("text-sm font-medium text-foreground")}>
          {title}
        </p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

interface StepperProps {
  steps: Array<{ title: string; description?: string }>
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col items-start gap-4 mb-2">
        {steps.map((step, index) => (
          <div key={step.title}>
            <Step
              title={step.title}
              description={step.description}
              number={index + 1}
            />
            {index < steps.length - 1 && (
              <div className="w-0.5 h-4 bg-muted-foreground ml-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

