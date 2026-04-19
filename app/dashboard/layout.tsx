import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import {
  LayoutDashboard,
  BarChart3,
  ArrowRightLeft,
  CreditCard,
  Tags,
  Target,
  TrendingUp,
  Briefcase,
  Upload,
  FileText,
  BarChart2,
  GitCompare,
  User,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Cockpit Contas
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {/* Main Section */}
            <div className="space-y-1">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <LayoutDashboard className="h-4 w-4 text-gray-500" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/dashboard/analise">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span>Análises</span>
                </Button>
              </Link>
            </div>

            {/* Gestão Financeira Section */}
            <div className="pt-6">
              <div className="px-3 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Gestão Financeira
                </h3>
              </div>
              <div className="space-y-1">
                <Link href="/dashboard/transacoes">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ArrowRightLeft className="h-4 w-4 text-gray-500" />
                    <span>Transações</span>
                  </Button>
                </Link>
                <Link href="/dashboard/cartoes">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>Cartões de Crédito</span>
                  </Button>
                </Link>
                <Link href="/dashboard/categorias">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Tags className="h-4 w-4 text-gray-500" />
                    <span>Categorias</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Planejamento Section */}
            <div className="pt-6">
              <div className="px-3 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Planejamento
                </h3>
              </div>
              <div className="space-y-1">
                <Link href="/dashboard/budget">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>Budget</span>
                  </Button>
                </Link>
                <Link href="/dashboard/metas">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span>Metas</span>
                  </Button>
                </Link>
                <Link href="/dashboard/projetos">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>Projetos</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Relatórios Section */}
            <div className="pt-6">
              <div className="px-3 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Relatórios
                </h3>
              </div>
              <div className="space-y-1">
                <Link href="/dashboard/relatorios/mensal">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Mensal</span>
                  </Button>
                </Link>
                <Link href="/dashboard/relatorios/anual">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <BarChart2 className="h-4 w-4 text-gray-500" />
                    <span>Anual</span>
                  </Button>
                </Link>
                <Link href="/dashboard/relatorios/comparativo">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <GitCompare className="h-4 w-4 text-gray-500" />
                    <span>Comparativos</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Configurações Section */}
            <div className="pt-6">
              <div className="px-3 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Configurações
                </h3>
              </div>
              <div className="space-y-1">
                <Link href="/dashboard/importar">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span>Importar Dados</span>
                  </Button>
                </Link>
                <Link href="/dashboard/perfil">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Perfil</span>
                  </Button>
                </Link>
                <Link href="/dashboard/configuracoes">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Configurações</span>
                  </Button>
                </Link>
              </div>
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-700">
                  {session.user.email?.split('@')[0]}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session.user.email}
                </p>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST" className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="w-full justify-start gap-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex flex-1 items-center justify-between">
            <h2 className="text-lg font-semibold lg:hidden">Cockpit Contas</h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
