"use client"

import { useAuth } from "@/contexts/auth-context"
import { apiClient, AdminPaymentDTO, AdminUserDTO, AdminStatsDTO, UserStatisticsDTO, SystemStatus, SystemStatusRequest, SystemStatusHistoryDTO, SystemStatusWithMetadata, GenerationProviderDTO, ProviderFallbackStatsDTO } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { 
  Shield,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Users,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  AlertTriangle,
  Server,
  BarChart3,
  Check,
  Zap,
  Ban,
  Unlock
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type TabType = 'stats' | 'payments' | 'users' | 'system' | 'providers'

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const [stats, setStats] = useState<AdminStatsDTO | null>(null)
  const [payments, setPayments] = useState<AdminPaymentDTO[]>([])
  const [users, setUsers] = useState<AdminUserDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSearch, setPaymentSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [systemStatus, setSystemStatus] = useState<SystemStatusWithMetadata | null>(null)
  const [systemHistory, setSystemHistory] = useState<SystemStatusHistoryDTO[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<SystemStatus>('ACTIVE')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [selectedUserIdsForStats, setSelectedUserIdsForStats] = useState<number[]>([])
  const [userStatistics, setUserStatistics] = useState<UserStatisticsDTO | null>(null)
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false)
  const [statisticsStartDate, setStatisticsStartDate] = useState<string>("")
  const [statisticsEndDate, setStatisticsEndDate] = useState<string>("")
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [userSearchFilter, setUserSearchFilter] = useState<string>("")
  const [providers, setProviders] = useState<GenerationProviderDTO[]>([])
  const [isSwitchingProvider, setIsSwitchingProvider] = useState(false)
  const [fallbackStats, setFallbackStats] = useState<ProviderFallbackStatsDTO | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/')
      return
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      loadData()
    }
  }, [isAuthenticated, isLoading, user, router])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (activeTab === 'stats') {
        const statsResponse = await apiClient.getAdminStats()
        if (statsResponse.data) {
          setStats(statsResponse.data)
        } else {
          setError(statsResponse.error || 'Ошибка загрузки статистики')
        }
        // Загружаем пользователей, если еще не загружены
        if (users.length === 0) {
          const usersResponse = await apiClient.getAdminUsers()
          if (usersResponse.data) {
            setUsers(usersResponse.data)
          }
        }
      } else if (activeTab === 'payments') {
        const response = await apiClient.getAdminPayments()
        if (response.data) {
          setPayments(response.data)
        } else {
          setError(response.error || 'Ошибка загрузки платежей')
        }
      } else if (activeTab === 'users') {
        const response = await apiClient.getAdminUsers()
        if (response.data) {
          setUsers(response.data)
        } else {
          setError(response.error || 'Ошибка загрузки пользователей')
        }
      } else if (activeTab === 'system') {
        const [statusResponse, historyResponse] = await Promise.all([
          apiClient.getAdminSystemStatus(),
          apiClient.getSystemStatusHistory(50)
        ])
        if (statusResponse.data) {
          setSystemStatus(statusResponse.data)
          setSelectedStatus(statusResponse.data.status)
          setStatusMessage(statusResponse.data.message || "")
        }
        if (historyResponse.data) {
          setSystemHistory(historyResponse.data)
        }
        if (statusResponse.error || historyResponse.error) {
          setError(statusResponse.error || historyResponse.error || 'Ошибка загрузки данных системы')
        }
      } else if (activeTab === 'providers') {
        const [providersResponse, fallbackStatsResponse] = await Promise.all([
          apiClient.getGenerationProviders(),
          apiClient.getProviderFallbackStats()
        ])
        if (providersResponse.data) {
          setProviders(providersResponse.data)
        } else {
          setError(providersResponse.error || 'Ошибка загрузки провайдеров')
        }
        if (fallbackStatsResponse.data) {
          setFallbackStats(fallbackStatsResponse.data)
        }
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке данных')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      loadData()
      // Сбрасываем статистику пользователя при смене вкладки
      if (activeTab !== 'stats') {
        setSelectedUserIdsForStats([])
        setUserStatistics(null)
        setStatisticsStartDate("")
        setStatisticsEndDate("")
      }
    }
  }, [activeTab])


  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CREATED':
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: SystemStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Активен'
      case 'DEGRADED':
        return 'Ограничен'
      case 'MAINTENANCE':
        return 'Техническое обслуживание'
      default:
        return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <Badge variant="default" className="bg-green-100 text-green-800">Оплачен</Badge>
      case 'CREATED':
        return <Badge variant="secondary">Создан</Badge>
      case 'PENDING':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Ожидает оплаты</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Неудачный</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="border-red-500 text-red-700">Отменен</Badge>
      case 'REFUNDED':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Возвращен</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredPayments = payments.filter(p => 
    (p.username && p.username.toLowerCase().includes(paymentSearch.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(paymentSearch.toLowerCase())) ||
    (p.telegramUsername && p.telegramUsername.toLowerCase().includes(paymentSearch.toLowerCase())) ||
    p.id.toString().includes(paymentSearch) ||
    p.userId.toString().includes(paymentSearch)
  )

  const filteredUsers = users.filter(u =>
    (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.telegramUsername && u.telegramUsername.toLowerCase().includes(userSearch.toLowerCase())) ||
    u.id.toString().includes(userSearch)
  )

  const loadUserStatistics = async () => {
    if (selectedUserIdsForStats.length === 0) {
      toast({
        title: "Ошибка",
        description: 'Выберите хотя бы одного пользователя',
        variant: "destructive",
      })
      return
    }

    setUserStatistics(null)
    setIsLoadingStatistics(true)
    setError(null)

    try {
      const startDate = statisticsStartDate ? new Date(statisticsStartDate).toISOString() : null
      const endDate = statisticsEndDate ? new Date(statisticsEndDate).toISOString() : null
      
      const response = await apiClient.getUserStatistics(selectedUserIdsForStats, startDate, endDate)
      if (response.data) {
        setUserStatistics(response.data)
      } else {
        setError(response.error || 'Ошибка загрузки статистики')
        toast({
          title: "Ошибка",
          description: response.error || 'Не удалось загрузить статистику',
          variant: "destructive",
        })
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке статистики')
      toast({
        title: "Ошибка",
        description: 'Произошла ошибка при загрузке статистики',
        variant: "destructive",
      })
    } finally {
      setIsLoadingStatistics(false)
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIdsForStats(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const selectAllFilteredUsers = () => {
    const filteredIds = filteredUsersForSelection.map(u => u.id)
    setSelectedUserIdsForStats(prev => {
      const newIds = filteredIds.filter(id => !prev.includes(id))
      return [...prev, ...newIds]
    })
  }

  const deselectAllFilteredUsers = () => {
    const filteredIds = filteredUsersForSelection.map(u => u.id)
    setSelectedUserIdsForStats(prev => prev.filter(id => !filteredIds.includes(id)))
  }

  const selectUsersWithPayment = () => {
    const usersWithPayment = filteredUsersForSelection
      .filter(u => u.hasSuccessfulPayment)
      .map(u => u.id)
    setSelectedUserIdsForStats(prev => {
      const newIds = usersWithPayment.filter(id => !prev.includes(id))
      return [...prev, ...newIds]
    })
  }

  const selectUsersWithoutPayment = () => {
    const usersWithoutPayment = filteredUsersForSelection
      .filter(u => !u.hasSuccessfulPayment)
      .map(u => u.id)
    setSelectedUserIdsForStats(prev => {
      const newIds = usersWithoutPayment.filter(id => !prev.includes(id))
      return [...prev, ...newIds]
    })
  }

  const filteredUsersForSelection = users.filter(u => {
    if (!userSearchFilter.trim()) return true
    const searchLower = userSearchFilter.toLowerCase()
    return (
      (u.username && u.username.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.telegramUsername && u.telegramUsername.toLowerCase().includes(searchLower)) ||
      u.id.toString().includes(userSearchFilter)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold">Доступ запрещен</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Требуется роль администратора
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen">
      {/* Background for entire page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)] pointer-events-none -z-10" />
      
      {/* Decorative stars/particles - равномерно по всей странице, на заднем фоне */}
      <div className="absolute top-20 left-[15%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none"></div>
      <div className="absolute top-32 left-[85%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[400px] left-[25%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[600px] left-[75%] w-3 h-3 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[500px] left-1/2 w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute top-[300px] left-[35%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute top-[250px] left-[65%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute top-[750px] left-[45%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.7s' }}></div>
      <div className="absolute top-[150px] left-[55%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.8s' }}></div>
      <div className="absolute top-[850px] left-[20%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-[550px] left-[80%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.1s' }}></div>
      <div className="absolute top-[900px] left-[40%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1200px] left-[60%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-[1100px] left-[30%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.3s' }}></div>
      <div className="absolute top-[1300px] left-[70%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute top-[1400px] left-[18%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.4s' }}></div>
      <div className="absolute top-[1500px] left-[50%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.1s' }}></div>
      <div className="absolute top-[1600px] left-[82%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '1.6s' }}></div>
      <div className="absolute top-[1700px] left-[28%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '0.9s' }}></div>
      <div className="absolute top-[1800px] left-[62%] w-2 h-2 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-60 dark:opacity-80 z-0 pointer-events-none" style={{ animationDelay: '1.7s' }}></div>
      <div className="absolute top-[1900px] left-[38%] w-1.5 h-1.5 bg-blue-300 dark:bg-blue-300 rounded-full animate-pulse opacity-70 dark:opacity-85 z-0 pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-[2000px] left-[72%] w-1 h-1 bg-blue-200 dark:bg-blue-200 rounded-full animate-pulse opacity-80 dark:opacity-90 z-0 pointer-events-none" style={{ animationDelay: '1.2s' }}></div>

      <div className="relative z-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
            <Link href="/">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">На главную</span>
              <span className="sm:hidden">Назад</span>
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Админ-панель</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Управление системой и просмотр статистики
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-1 sm:gap-2 border-b min-w-fit sm:min-w-0">
        <Button
          variant={activeTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stats')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="whitespace-nowrap">Статистика</span>
        </Button>
        <Button
          variant={activeTab === 'payments' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('payments')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="whitespace-nowrap">Платежи</span>
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="whitespace-nowrap">Пользователи</span>
        </Button>
        <Button
          variant={activeTab === 'system' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('system')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Server className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="whitespace-nowrap">Система</span>
        </Button>
        <Button
          variant={activeTab === 'providers' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('providers')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="whitespace-nowrap">Провайдеры</span>
        </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Ошибка загрузки данных</p>
              <p className="mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'stats' && stats ? (
        <>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Платежей сегодня</CardTitle>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.todayPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Всего платежей</CardTitle>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Общая выручка</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Выручка сегодня</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stats.todayRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Выручка за неделю</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stats.weekRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Выручка за месяц</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stats.monthRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Выручка за последний год</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stats.yearRevenue.toLocaleString('ru-RU')} ₽</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Регистраций сегодня</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.todayRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Регистраций за неделю</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.weekRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Регистраций за месяц</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.monthRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Регистраций за год</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.yearRegistrations}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Статистика пользователя */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Статистика генераций пользователя
            </CardTitle>
            <CardDescription>
              Выберите пользователей и период для просмотра статистики генераций
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Пользователи</Label>
                <DropdownMenu open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {selectedUserIdsForStats.length === 0
                          ? "Выберите пользователей"
                          : `Выбрано: ${selectedUserIdsForStats.length}`}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-hidden flex flex-col" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="p-2 border-b space-y-2">
                      <Input
                        placeholder="Поиск по ID, username, email, telegram..."
                        value={userSearchFilter}
                        onChange={(e) => setUserSearchFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full"
                      />
                      {filteredUsersForSelection.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-7"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                selectAllFilteredUsers()
                              }}
                            >
                              Выбрать все
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-7"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                deselectAllFilteredUsers()
                              }}
                            >
                              Снять все
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-7"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                selectUsersWithPayment()
                              }}
                            >
                              С оплатой
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-7"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                selectUsersWithoutPayment()
                              }}
                            >
                              Без оплаты
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-[300px]">
                      {filteredUsersForSelection.length > 0 ? (
                        filteredUsersForSelection.map((user) => {
                          const isSelected = selectedUserIdsForStats.includes(user.id)
                          return (
                            <div
                              key={user.id}
                              onClick={() => toggleUserSelection(user.id)}
                              className="flex items-start gap-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                <div className={cn(
                                  "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                                  isSelected 
                                    ? "bg-primary border-primary" 
                                    : "border-input bg-background"
                                )}>
                                  {isSelected && (
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium">{user.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  ID: {user.id}
                                  {user.email && ` • ${user.email}`}
                                  {user.telegramUsername && ` • @${user.telegramUsername}`}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Пользователи не найдены
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label htmlFor="statisticsStartDate">Начало периода</Label>
                <Input
                  id="statisticsStartDate"
                  type="datetime-local"
                  value={statisticsStartDate}
                  onChange={(e) => setStatisticsStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="statisticsEndDate">Конец периода</Label>
                <Input
                  id="statisticsEndDate"
                  type="datetime-local"
                  value={statisticsEndDate}
                  onChange={(e) => setStatisticsEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={loadUserStatistics}
              disabled={isLoadingStatistics || selectedUserIdsForStats.length === 0}
              className="w-full md:w-auto"
            >
              {isLoadingStatistics ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Загрузить статистику'
              )}
            </Button>
            
            {userStatistics && (
              <div className="space-y-4 mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Общая статистика</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Всего сгенерировано:</span>
                        <span className="font-semibold text-lg">{userStatistics.totalCount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Потрачено поинтов:</span>
                        <span className="font-semibold text-lg text-primary">{userStatistics.totalPointsSpent || 0}</span>
                      </div>
                      {userStatistics.totalCostUsd !== null && userStatistics.totalCostUsd !== undefined && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Себестоимость:</span>
                          <span className="font-semibold text-lg text-green-600">${userStatistics.totalCostUsd.toFixed(3)}</span>
                        </div>
                      )}
                      {userStatistics.startDate && (
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground pt-2 border-t">
                          <span>Период:</span>
                          <span className="font-medium">
                            {formatDate(new Date(userStatistics.startDate))} - {userStatistics.endDate ? formatDate(new Date(userStatistics.endDate)) : 'настоящее время'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Обычная модель</CardTitle>
                      <CardDescription>Nano Banana</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-3xl font-bold">{userStatistics.regularModelCount}</div>
                        <p className="text-sm text-muted-foreground mt-1">сгенерировано</p>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xl font-semibold text-primary">{userStatistics.regularModelPointsSpent || 0}</div>
                        <p className="text-sm text-muted-foreground">поинтов потрачено</p>
                      </div>
                      {userStatistics.regularModelCostUsd !== null && userStatistics.regularModelCostUsd !== undefined && (
                        <div className="pt-2 border-t">
                          <div className="text-xl font-semibold text-green-600">${userStatistics.regularModelCostUsd.toFixed(3)}</div>
                          <p className="text-sm text-muted-foreground">себестоимость</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ПРО модель</CardTitle>
                      <CardDescription>Nano Banana PRO</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-3xl font-bold">{userStatistics.proModelCount}</div>
                        <p className="text-sm text-muted-foreground">сгенерировано</p>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xl font-semibold text-primary">{userStatistics.proModelPointsSpent || 0}</div>
                        <p className="text-sm text-muted-foreground">поинтов потрачено</p>
                      </div>
                      {userStatistics.proModelCostUsd !== null && userStatistics.proModelCostUsd !== undefined && (
                        <div className="pt-2 border-t">
                          <div className="text-xl font-semibold text-green-600">${userStatistics.proModelCostUsd.toFixed(3)}</div>
                          <p className="text-sm text-muted-foreground">себестоимость</p>
                        </div>
                      )}
                      {userStatistics.proModelCount > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">По разрешениям:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">1K:</span>
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-semibold">{userStatistics.proModelByResolution['1K'] || 0} сгенерировано</span>
                                <span className="text-xs text-muted-foreground">({userStatistics.proModelPointsByResolution?.['1K'] || 0} поинтов)</span>
                                {userStatistics.proModelCostUsdByResolution?.['1K'] !== null && userStatistics.proModelCostUsdByResolution?.['1K'] !== undefined && (
                                  <span className="text-xs text-green-600 font-medium">${userStatistics.proModelCostUsdByResolution['1K'].toFixed(3)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">2K:</span>
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-semibold">{userStatistics.proModelByResolution['2K'] || 0} сгенерировано</span>
                                <span className="text-xs text-muted-foreground">({userStatistics.proModelPointsByResolution?.['2K'] || 0} поинтов)</span>
                                {userStatistics.proModelCostUsdByResolution?.['2K'] !== null && userStatistics.proModelCostUsdByResolution?.['2K'] !== undefined && (
                                  <span className="text-xs text-green-600 font-medium">${userStatistics.proModelCostUsdByResolution['2K'].toFixed(3)}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">4K:</span>
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-semibold">{userStatistics.proModelByResolution['4K'] || 0} сгенерировано</span>
                                <span className="text-xs text-muted-foreground">({userStatistics.proModelPointsByResolution?.['4K'] || 0} поинтов)</span>
                                {userStatistics.proModelCostUsdByResolution?.['4K'] !== null && userStatistics.proModelCostUsdByResolution?.['4K'] !== undefined && (
                                  <span className="text-xs text-green-600 font-medium">${userStatistics.proModelCostUsdByResolution['4K'].toFixed(3)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      ) : activeTab === 'payments' ? (
        <Card className="w-full max-w-full overflow-hidden">
          <CardHeader className="w-full max-w-full">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">Платежи</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {filteredPayments.length} платежей
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по ID, username, email..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="pl-8 w-full max-w-full"
                  />
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full max-w-full overflow-hidden">
            {filteredPayments.length > 0 ? (
              <div className="space-y-4 w-full">
                {filteredPayments.map((payment) => {
                  // Используем описание как есть, так как оно уже содержит всю необходимую информацию
                  const displayDescription = payment.description;
                  
                  // Формируем строку с информацией о пользователе (без Telegram username)
                  const userInfoParts = [
                    payment.username,
                    payment.email && payment.email.trim() ? `(${payment.email})` : null
                  ].filter(Boolean);
                  
                  const userInfo = userInfoParts.join(' ');
                  const avatarUrl = payment.telegramPhotoUrl;
                  
                  return (
                    <div key={payment.id} className="w-full max-w-full border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 w-full">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            {avatarUrl ? (
                              <AvatarImage src={avatarUrl} alt={payment.username} />
                            ) : null}
                            <AvatarFallback className="text-xs sm:text-sm">
                              {payment.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="font-medium text-sm sm:text-base break-words overflow-wrap-anywhere">{displayDescription}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere">
                              Платеж #{payment.id} • Пользователь ID: {payment.userId} • {userInfo}
                            </p>
                            {payment.telegramFirstName && (
                              <p className="text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                                Telegram: {payment.telegramFirstName}
                                {payment.telegramUsername ? ` (@${payment.telegramUsername})` : payment.telegramId ? ` (ID: ${payment.telegramId})` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                          <div className="font-semibold text-base sm:text-lg mb-1 break-words">
                            {payment.amount.toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                          <span className="break-words">
                            <strong>Создан:</strong> {formatDate(new Date(payment.createdAt))}
                          </span>
                          {payment.paidAt && (
                            <span className="break-words">
                              <strong>Оплачен:</strong> {formatDate(new Date(payment.paidAt))}
                            </span>
                          )}
                        </div>
                        {payment.isTest && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-300 text-orange-600 w-fit flex-shrink-0">
                            Тест
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Платежи не найдены</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'users' ? (
        <Card className="w-full max-w-full overflow-hidden">
          <CardHeader className="w-full max-w-full">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">Пользователи</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {filteredUsers.length} пользователей
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по ID, username, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 w-full max-w-full"
                  />
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full max-w-full overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="space-y-4 w-full">
                {filteredUsers.map((user) => {
                  const avatarUrl = user.telegramPhotoUrl;
                  
                  return (
                    <div key={user.id} className="w-full max-w-full border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 w-full">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            {avatarUrl ? (
                              <AvatarImage src={avatarUrl} alt={user.username} />
                            ) : null}
                            <AvatarFallback className="text-sm">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="font-medium text-sm sm:text-base break-words overflow-wrap-anywhere">{user.username}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words overflow-wrap-anywhere mt-1">
                              ID: {user.id}
                            </p>
                            {user.email && user.email.trim() && (
                              <p className="text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                                email: {user.email}
                              </p>
                            )}
                            {user.telegramFirstName && (
                              <p className="text-xs text-muted-foreground mt-1 break-words overflow-wrap-anywhere">
                                Telegram: {user.telegramFirstName}
                                {user.telegramUsername ? ` (@${user.telegramUsername})` : user.telegramId ? ` (ID: ${user.telegramId})` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                          <div className="font-semibold text-base sm:text-lg mb-1 break-words">
                            {user.points} поинтов
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                            {user.blocked && (
                              <Badge variant="destructive" className="text-xs">
                                Заблокирован
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                          <span className="break-words">
                            <strong>Создан:</strong> {formatDate(new Date(user.createdAt))}
                          </span>
                          <span className="break-words">
                            <strong>Email подтвержден:</strong> {user.emailVerified ? 'Да' : 'Нет'}
                          </span>
                          {user.telegramId && (
                            <span className="break-words">
                              <strong>Telegram ID:</strong> {user.telegramId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const newBlockedStatus = !user.blocked
                                const response = await apiClient.blockUser(user.id, newBlockedStatus)
                                if (response.data) {
                                  toast({
                                    title: newBlockedStatus ? "Пользователь заблокирован" : "Пользователь разблокирован",
                                    description: response.data.message,
                                  })
                                  // Обновляем локальное состояние
                                  setUsers(prevUsers => 
                                    prevUsers.map(u => 
                                      u.id === user.id ? { ...u, blocked: newBlockedStatus } : u
                                    )
                                  )
                                } else {
                                  throw new Error(response.error || "Ошибка изменения статуса")
                                }
                              } catch (error: any) {
                                toast({
                                  title: "Ошибка",
                                  description: error.message || "Не удалось изменить статус блокировки",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="text-xs"
                          >
                            {user.blocked ? (
                              <>
                                <Unlock className="h-3 w-3 mr-1" />
                                Разблокировать
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Заблокировать
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Пользователи не найдены</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'system' ? (
        <div className="space-y-6">
          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Текущий статус системы
              </CardTitle>
              <CardDescription>
                Управление статусом системы и оповещениями для пользователей
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemStatus && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="w-32">Текущий статус:</Label>
                    <Badge 
                      variant={systemStatus.status === 'ACTIVE' ? 'default' : 
                              systemStatus.status === 'DEGRADED' ? 'secondary' : 'destructive'}
                      className={cn(
                        "text-sm",
                        systemStatus.status === 'DEGRADED' && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                      )}
                    >
                      {systemStatus.status === 'ACTIVE' && '🟢 Активен'}
                      {systemStatus.status === 'DEGRADED' && '🟡 Ограничен'}
                      {systemStatus.status === 'MAINTENANCE' && '🔴 Техническое обслуживание'}
                    </Badge>
                    {systemStatus.isSystem && (
                      <Badge variant="outline" className="text-xs">
                        Автоматический
                      </Badge>
                    )}
                  </div>
                  {systemStatus.message && (
                    <div className="flex items-start gap-4">
                      <Label className="w-32">Сообщение:</Label>
                      <p className="text-sm text-muted-foreground flex-1">{systemStatus.message}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status-select">Новый статус</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => {
                      setSelectedStatus(value as SystemStatus)
                      // Устанавливаем дефолтное сообщение при выборе статуса
                      if (value === 'DEGRADED') {
                        setStatusMessage("Система работает с ограничениями, возможны задержки")
                      } else if (value === 'MAINTENANCE') {
                        setStatusMessage("Серьезные проблемы с инфраструктурой, сервис может быть недоступен")
                      } else {
                        setStatusMessage("")
                      }
                    }}
                  >
                    <SelectTrigger id="status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">🟢 Активен</SelectItem>
                      <SelectItem value="DEGRADED">🟡 Ограничен</SelectItem>
                      <SelectItem value="MAINTENANCE">🔴 Техническое обслуживание</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedStatus !== 'ACTIVE' && (
                  <div className="space-y-2">
                    <Label htmlFor="status-message">Сообщение для пользователей</Label>
                    <Textarea
                      id="status-message"
                      value={statusMessage}
                      onChange={(e) => setStatusMessage(e.target.value)}
                      placeholder={
                        selectedStatus === 'DEGRADED'
                          ? "Система работает с ограничениями, возможны задержки"
                          : "Серьезные проблемы с инфраструктурой, сервис может быть недоступен"
                      }
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Оставьте пустым, чтобы использовать дефолтное сообщение
                    </p>
                  </div>
                )}

                <Button
                  onClick={async () => {
                    setIsUpdatingStatus(true)
                    try {
                      const request: SystemStatusRequest = {
                        status: selectedStatus,
                        message: selectedStatus === 'ACTIVE' ? undefined : (statusMessage.trim() || undefined)
                      }
                      const response = await apiClient.updateSystemStatus(request)
                      if (response.data) {
                        toast({
                          title: "Статус обновлен",
                          description: "Статус системы успешно обновлен",
                        })
                        // Обновляем данные
                        await loadData()
                      } else {
                        toast({
                          title: "Ошибка",
                          description: response.error || "Не удалось обновить статус",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Ошибка",
                        description: "Произошла ошибка при обновлении статуса",
                        variant: "destructive",
                      })
                    } finally {
                      setIsUpdatingStatus(false)
                    }
                  }}
                  disabled={isUpdatingStatus}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingStatus ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Обновление...
                    </>
                  ) : (
                    "Обновить статус"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                История изменений
              </CardTitle>
              <CardDescription>
                Последние изменения статуса системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemHistory.length > 0 ? (
                <div className="space-y-3">
                  {systemHistory.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.status === 'ACTIVE' ? 'default' : 
                                    item.status === 'DEGRADED' ? 'secondary' : 'destructive'}
                            className={cn(
                              "text-xs",
                              item.status === 'DEGRADED' && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                            )}
                          >
                            {getStatusLabel(item.status)}
                          </Badge>
                          {item.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              Автоматический
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(new Date(item.createdAt))}
                        </span>
                      </div>
                      {item.message && (
                        <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                      )}
                      {item.username && (
                        <p className="text-xs text-muted-foreground">
                          Изменено пользователем: {item.username}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>История изменений пуста</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'providers' ? (
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Управление провайдерами генерации
            </CardTitle>
            <CardDescription>
              Выберите активного провайдера для генерации изображений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {providers.length > 0 ? (
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.code}
                    className={cn(
                      "border rounded-lg p-4 transition-colors",
                      provider.active
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{provider.displayName}</h3>
                          {provider.active && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              Активен
                            </Badge>
                          )}
                          {!provider.available && (
                            <Badge variant="destructive">Недоступен</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Код провайдера: <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{provider.code}</code>
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={async () => {
                              if (provider.active) {
                                toast({
                                  title: "Информация",
                                  description: "Этот провайдер уже активен",
                                })
                                return
                              }
                              if (!provider.available) {
                                toast({
                                  title: "Ошибка",
                                  description: "Провайдер недоступен",
                                  variant: "destructive",
                                })
                                return
                              }
                              setIsSwitchingProvider(true)
                              try {
                                const response = await apiClient.setActiveProvider(provider.code)
                                if (response.data) {
                                  toast({
                                    title: "Успешно",
                                    description: `Провайдер ${provider.displayName} установлен как активный`,
                                  })
                                  // Обновляем список провайдеров
                                  const providersResponse = await apiClient.getGenerationProviders()
                                  if (providersResponse.data) {
                                    setProviders(providersResponse.data)
                                  }
                                } else {
                                  toast({
                                    title: "Ошибка",
                                    description: response.error || "Не удалось переключить провайдера",
                                    variant: "destructive",
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Ошибка",
                                  description: "Произошла ошибка при переключении провайдера",
                                  variant: "destructive",
                                })
                              } finally {
                                setIsSwitchingProvider(false)
                              }
                            }}
                            disabled={provider.active || !provider.available || isSwitchingProvider}
                            variant={provider.active ? "default" : "outline"}
                            className="w-full sm:w-auto"
                          >
                            {isSwitchingProvider ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Переключение...
                              </>
                            ) : provider.active ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Активен
                              </>
                            ) : (
                              "Активировать"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Провайдеры не найдены</p>
                <Button onClick={loadData} variant="outline" className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Статистика Fallback переключений */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Статистика Fallback переключений
            </CardTitle>
            <CardDescription>
              Автоматические переключения на резервный провайдер при ошибках
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fallbackStats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Сегодня</div>
                    <div className="text-2xl font-bold">{fallbackStats.todayCount}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">За 7 дней</div>
                    <div className="text-2xl font-bold">{fallbackStats.last7DaysCount}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">За 30 дней</div>
                    <div className="text-2xl font-bold">{fallbackStats.last30DaysCount}</div>
                  </div>
                </div>

                {Object.keys(fallbackStats.countByActiveProvider).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">По активным провайдерам (30 дней)</h3>
                    <div className="space-y-2">
                      {Object.entries(fallbackStats.countByActiveProvider).map(([provider, count]) => (
                        <div key={provider} className="flex items-center justify-between border rounded-lg p-3">
                          <span className="font-medium">{provider === 'FAL_AI' ? 'FAL AI' : provider === 'LAOZHANG_AI' ? 'LaoZhang AI' : provider}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(fallbackStats.countByErrorType).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">По типам ошибок (30 дней)</h3>
                    <div className="space-y-2">
                      {Object.entries(fallbackStats.countByErrorType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([errorType, count]) => (
                          <div key={errorType} className="flex items-center justify-between border rounded-lg p-3">
                            <span className="font-medium">
                              {errorType === 'TIMEOUT' ? 'Таймаут' :
                               errorType === 'CONNECTION_ERROR' ? 'Ошибка подключения' :
                               errorType === 'HTTP_5XX' ? 'HTTP 5xx (серверная ошибка)' :
                               errorType === 'PAYLOAD_TOO_LARGE' ? 'Payload Too Large (413)' :
                               errorType === 'SERVICE_UNAVAILABLE' ? 'Service Unavailable (503)' :
                               errorType === 'UNKNOWN_ERROR' ? 'Неизвестная ошибка' :
                               errorType}
                            </span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {fallbackStats.last30DaysCount === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Нет fallback переключений за последние 30 дней</p>
                    <p className="text-sm mt-2">Все запросы успешно обрабатываются активным провайдером</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                <p>Загрузка статистики...</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      ) : null}
      </div>
    </div>
  )
}

