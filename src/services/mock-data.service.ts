import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'CEO' | 'Project Manager' | 'Designer';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  email: string;
  avatar: string;
  metrics: {
    completedProjects: number;
    commitmentRate: number; // percentage
    avgCompletionTime: number; // days
    activeLoad?: number; // Calculated load for assignment
  };
}

// Updated Statuses for PM Kanban Flow
export type ProjectStatus = 
  'New Order' | 
  'Brief Review' | 
  'In Progress' | 
  'Internal Review' | 
  'Client Feedback' | 
  'Revisions' | 
  'Completed' | 
  'Cancelled';

export type Priority = 'High' | 'Medium' | 'Low';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  attachment?: { name: string; type: 'file' | 'image' | 'concept' | 'final' }; // Added concept/final types
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string; // Added description field
  clientName: string; 
  assigneeId?: string; 
  status: ProjectStatus;
  priority: Priority; 
  revenue: number; 
  paidAmount: number;
  deliveryDate: string; 
  revisionsCount: number; 
  
  // Time Tracking
  estimatedHours: number;
  actualHours: number;
  isTimerRunning: boolean;
  
  // Communication
  messages: ChatMessage[];
  
  // Designer Checklist
  checklist: ChecklistItem[];
}

export interface Notification {
  id: string;
  type: 'Alert' | 'Info' | 'Success';
  message: string;
  recipientId: string | 'ALL';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // --- State Signals ---
  users = signal<User[]>([
    { id: 'u1', name: 'فيصل المدير', role: 'CEO', status: 'Active', email: 'faisal@company.com', avatar: 'https://i.pravatar.cc/150?u=1', metrics: { completedProjects: 0, commitmentRate: 100, avgCompletionTime: 0 } },
    { id: 'u2', name: 'سارة - مدير مشاريع', role: 'Project Manager', status: 'Active', email: 'sarah@company.com', avatar: 'https://i.pravatar.cc/150?u=2', metrics: { completedProjects: 45, commitmentRate: 98, avgCompletionTime: 12 } },
    { id: 'u3', name: 'محمد - مصمم', role: 'Designer', status: 'Active', email: 'mohammed@company.com', avatar: 'https://i.pravatar.cc/150?u=3', metrics: { completedProjects: 32, commitmentRate: 92, avgCompletionTime: 5, activeLoad: 80 } },
    { id: 'u4', name: 'لمى - مصمم', role: 'Designer', status: 'Inactive', email: 'lama@company.com', avatar: 'https://i.pravatar.cc/150?u=4', metrics: { completedProjects: 12, commitmentRate: 85, avgCompletionTime: 6, activeLoad: 20 } },
    { id: 'u5', name: 'خالد - مصمم', role: 'Designer', status: 'Active', email: 'khaled@company.com', avatar: 'https://i.pravatar.cc/150?u=5', metrics: { completedProjects: 15, commitmentRate: 95, avgCompletionTime: 4, activeLoad: 40 } },
  ]);

  projects = signal<Project[]>([
    { 
      id: 'p1', title: 'تطوير موقع شركة عقارية', description: 'تصميم وبرمجة موقع تعريفي للشركة مع لوحة تحكم للعقارات.', clientName: 'العقارية الأولى', assigneeId: 'u3', status: 'Completed', priority: 'High', revenue: 15000, paidAmount: 15000, deliveryDate: '2023-10-15', revisionsCount: 2, 
      estimatedHours: 40, actualHours: 38, isTimerRunning: false, messages: [], checklist: []
    },
    { 
      id: 'p2', title: 'تطبيق توصيل طلبات', description: 'تطبيق موبايل (iOS & Android) للعملاء والمندوبين.', clientName: 'فاست فود', assigneeId: 'u3', status: 'In Progress', priority: 'High', revenue: 45000, paidAmount: 15000, deliveryDate: '2024-06-01', revisionsCount: 5, 
      estimatedHours: 120, actualHours: 60, isTimerRunning: true, messages: [],
      checklist: [
        { id: 'c1', text: 'تصميم واجهة تسجيل الدخول', isCompleted: true },
        { id: 'c2', text: 'تعديل أيقونات القائمة الرئيسية', isCompleted: false },
        { id: 'c3', text: 'إضافة الوضع الليلي', isCompleted: false }
      ]
    },
    { 
      id: 'p3', title: 'هوية بصرية لمطعم', clientName: 'مطعم السعادة', assigneeId: 'u5', status: 'Internal Review', priority: 'Medium', revenue: 5000, paidAmount: 2500, deliveryDate: '2024-05-20', revisionsCount: 1, 
      estimatedHours: 20, actualHours: 18, isTimerRunning: false, messages: [], checklist: []
    },
    { 
      id: 'p4', title: 'حملة تسويقية موسمية', clientName: 'أسواق المدينة', assigneeId: 'u4', status: 'Client Feedback', priority: 'Low', revenue: 8000, paidAmount: 8000, deliveryDate: '2024-05-25', revisionsCount: 0, 
      estimatedHours: 15, actualHours: 10, isTimerRunning: false, messages: [], checklist: []
    },
    { 
      id: 'p5', title: 'لوحة تحكم SaaS', clientName: 'تقنية المستقبل', assigneeId: 'u3', status: 'Revisions', priority: 'High', revenue: 25000, paidAmount: 12500, deliveryDate: '2024-05-15', revisionsCount: 3, 
      estimatedHours: 80, actualHours: 85, isTimerRunning: false, messages: [
        { id: 'm1', senderId: 'u2', text: 'الرجاء تعديل الألوان في الصفحة الرئيسية', timestamp: Date.now() - 1000000 },
        { id: 'm2', senderId: 'u3', text: 'تم التعديل، بانتظار المراجعة @سارة', timestamp: Date.now() - 500000 }
      ],
      checklist: [
        { id: 'c1', text: 'تكبير الخط في الهيدر', isCompleted: false },
        { id: 'c2', text: 'تحسين التباين في الأزرار', isCompleted: true }
      ]
    },
    { 
      id: 'p9', title: 'تصميم هوية بصرية لشركة تقنية', clientName: 'تك زون', status: 'New Order', priority: 'Medium', revenue: 12000, paidAmount: 0, deliveryDate: '2024-06-10', revisionsCount: 0, 
      estimatedHours: 30, actualHours: 0, isTimerRunning: false, messages: [], checklist: [] 
    },
    { 
      id: 'p10', title: 'تطبيق موبايل - تجارة إلكترونية', clientName: 'متجري', status: 'Brief Review', priority: 'High', revenue: 55000, paidAmount: 0, deliveryDate: '2024-07-01', revisionsCount: 0, 
      estimatedHours: 200, actualHours: 5, isTimerRunning: false, messages: [], checklist: [] 
    },
  ]);

  notifications = signal<Notification[]>([
    { id: 'n1', type: 'Alert', message: 'مشروع "تطبيق توصيل طلبات" يقترب من موعد التسليم النهائي.', recipientId: 'ALL', timestamp: Date.now() - 100000 },
    { id: 'n2', type: 'Success', message: 'تم استلام دفعة جديدة لمشروع "لوحة تحكم SaaS".', recipientId: 'u1', timestamp: Date.now() - 500000 },
  ]);

  constructor() {
    this.startRealTimeUpdates();
  }

  // --- Real-time Simulation ---
  private startRealTimeUpdates() {
    // Every 8 seconds, perform a random update to simulate live activity
    setInterval(() => {
      const rand = Math.random();
      if (rand < 0.2) {
        this.simulateNewOrder();
      }
      // Removed status shuffle for now to keep Kanban stable for drag/drop demo
    }, 8000);
  }

  private simulateNewOrder() {
    const titles = ['متجر عطور', 'تطبيق لياقة', 'موقع شركة مقاولات', 'تصميم عبوات منتج'];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const newProject: Project = {
      id: `p-${Date.now()}`,
      title: randomTitle,
      clientName: 'عميل جديد',
      status: 'New Order',
      priority: Math.random() > 0.5 ? 'High' : 'Medium',
      revenue: Math.floor(Math.random() * 20000) + 3000,
      paidAmount: 0,
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revisionsCount: 0,
      estimatedHours: 20,
      actualHours: 0,
      isTimerRunning: false,
      messages: [],
      checklist: []
    };
    
    this.projects.update(current => [newProject, ...current]);
    this.addNotification({
      id: `n-${Date.now()}`,
      type: 'Info',
      message: `طلب جديد وصل: "${randomTitle}"`,
      recipientId: 'ALL',
      timestamp: Date.now()
    });
  }

  // --- Actions ---

  addNewProject(data: Partial<Project>) {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      title: data.title || 'مشروع جديد بدون عنوان',
      description: data.description || '',
      clientName: data.clientName || 'عميل جديد',
      status: 'New Order', // Always starts here
      priority: data.priority || 'Medium',
      revenue: data.revenue || 0,
      paidAmount: 0,
      deliveryDate: data.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week
      revisionsCount: 0,
      estimatedHours: data.estimatedHours || 0,
      actualHours: 0,
      isTimerRunning: false,
      messages: [],
      assigneeId: data.assigneeId, // Set assignee if provided
      checklist: []
    };

    this.projects.update(current => [newProject, ...current]);
    
    // If assigned immediately, update user metrics
    if (data.assigneeId) {
      this.users.update(users => users.map(u => 
        u.id === data.assigneeId ? { ...u, metrics: { ...u.metrics, activeLoad: (u.metrics.activeLoad || 0) + 10 } } : u
      ));
    }

    this.addNotification({
      id: `n-${Date.now()}`,
      type: 'Info',
      message: `تم إضافة طلب جديد يدوياً: "${newProject.title}"`,
      recipientId: 'ALL',
      timestamp: Date.now()
    });
  }

  updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
    );
  }

  assignDesigner(projectId: string, designerId: string) {
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, assigneeId: designerId } : p)
    );
    // Simulate updating load
    this.users.update(users => users.map(u => 
      u.id === designerId ? { ...u, metrics: { ...u.metrics, activeLoad: (u.metrics.activeLoad || 0) + 10 } } : u
    ));
  }

  toggleTimer(projectId: string) {
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, isTimerRunning: !p.isTimerRunning } : p)
    );
  }

  toggleChecklistItem(projectId: string, itemId: string) {
    this.projects.update(projects =>
      projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            checklist: p.checklist.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item)
          };
        }
        return p;
      })
    );
  }

  addMessage(projectId: string, text: string, senderId: string, attachment?: { name: string, type: 'file' | 'image' | 'concept' | 'final' }) {
    const msg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderId,
      text,
      timestamp: Date.now(),
      attachment
    };
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, messages: [...p.messages, msg] } : p)
    );
  }

  // --- Computed Metrics ---
  projectCounts = computed(() => {
    const counts: any = { total: 0, completed: 0, inProgress: 0, newRequest: 0, internalReview: 0, waitingClient: 0, revisions: 0, cancelled: 0 };
    this.projects().forEach(p => {
      counts.total++;
      if (p.status === 'Completed') counts.completed++;
      else if (p.status === 'New Order') counts.newRequest++;
      else if (p.status === 'In Progress') counts.inProgress++;
      else if (p.status === 'Cancelled') counts.cancelled++;
      else counts.inProgress++; // Simplified for existing dashboard mapping
    });
    return counts;
  });

  cashFlow = computed(() => {
    const projects = this.projects();
    const paid = projects.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalPotential = projects.filter(p => p.status !== 'Cancelled').reduce((acc, curr) => acc + curr.revenue, 0);
    return { paidToday: 2500, paidTotal: paid, remaining: totalPotential - paid, collectionRate: totalPotential > 0 ? (paid / totalPotential) * 100 : 0 };
  });

  // --- Helpers ---
  addUser(user: User) { this.users.update(users => [...users, user]); }
  removeUser(id: string) { this.users.update(users => users.filter(u => u.id !== id)); }
  toggleUserStatus(id: string) { this.users.update(users => users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)); }
  addNotification(n: Notification) { this.notifications.update(ns => [n, ...ns]); }
  
  calculateRevenue(period: any, start?: any, end?: any) {
      return { total: 150000, previousTotal: 120000, growth: 25 }; 
  }
  
  getRevenueHistoryData() {
    return [
      { date: 'يناير', value: 35000 }, { date: 'فبراير', value: 42000 }, { date: 'مارس', value: 38000 },
      { date: 'أبريل', value: 55000 }, { date: 'مايو', value: 48000 }, { date: 'يونيو', value: 62000 },
      { date: 'يوليو', value: 75000 }, { date: 'أغسطس', value: 68000 }, { date: 'سبتمبر', value: 85000 },
      { date: 'أكتوبر', value: 92000 },
    ];
  }
}