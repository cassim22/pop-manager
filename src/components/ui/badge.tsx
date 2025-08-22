import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success-100 text-success-700 hover:bg-success-200",
        warning:
          "border-transparent bg-warning-100 text-warning-700 hover:bg-warning-200",
        danger:
          "border-transparent bg-danger-100 text-danger-700 hover:bg-danger-200",
        info:
          "border-transparent bg-info-100 text-info-700 hover:bg-info-200",
        // Status específicos do sistema
        operacional:
          "border-transparent bg-success-100 text-success-700",
        manutencao:
          "border-transparent bg-warning-100 text-warning-700",
        critico:
          "border-transparent bg-danger-100 text-danger-700",
        desmobilizacao:
          "border-transparent bg-gray-100 text-gray-700",
        desmobilizado:
          "border-transparent bg-gray-200 text-gray-800",
        // Prioridades
        baixa:
          "border-transparent bg-gray-100 text-gray-700",
        media:
          "border-transparent bg-info-100 text-info-700",
        alta:
          "border-transparent bg-warning-100 text-warning-700",
        critica:
          "border-transparent bg-danger-100 text-danger-700",
        // Status de técnico
        disponivel:
          "border-transparent bg-success-100 text-success-700",
        em_atendimento:
          "border-transparent bg-info-100 text-info-700",
        ferias:
          "border-transparent bg-warning-100 text-warning-700",
        licenca:
          "border-transparent bg-gray-100 text-gray-700",
        // Status de atividade
        pendente:
          "border-transparent bg-warning-100 text-warning-700",
        em_andamento:
          "border-transparent bg-info-100 text-info-700",
        concluida:
          "border-transparent bg-success-100 text-success-700",
        cancelada:
          "border-transparent bg-gray-100 text-gray-700",
        // Status de gerador
        ativo:
          "border-transparent bg-success-100 text-success-700",
        inativo:
          "border-transparent bg-gray-100 text-gray-700",
        // Status de manutenção
        agendada:
          "border-transparent bg-info-100 text-info-700",
        atrasada:
          "border-transparent bg-danger-100 text-danger-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }