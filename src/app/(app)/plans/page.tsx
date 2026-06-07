import Link from "next/link";
import { planRepository } from "@/repositories/plan.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Target } from "lucide-react";

export default async function PlansPage() {
  const plans = await planRepository.findAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planos de Treino</h1>
        <p className="text-muted-foreground text-sm">
          {plans.length === 1
            ? "1 plano disponível"
            : `${plans.length} planos disponíveis`}
        </p>
      </div>

      {plans.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Plano não encontrado. Execute o seed do banco de dados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass-card hover:border-primary/40 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.goal}</p>
                </div>
                {plan.isActive && <Badge variant="success">Ativo</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {format(plan.startDate, "d MMM yyyy", { locale: ptBR })} —{" "}
                  {format(plan.endDate, "d MMM yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm">
                  {plan.workouts.length} treinos concluídos de{" "}
                  {plan._count.workouts} total
                </p>
                <Link href={`/plans/${plan.id}`} className="block">
                  <Button size="sm" className="w-full">
                    Abrir plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
