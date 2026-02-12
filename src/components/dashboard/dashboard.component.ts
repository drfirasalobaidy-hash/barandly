import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { GeminiService } from '../../services/gemini.service';
import { RevenueChartComponent } from './revenue-chart.component';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RevenueChartComponent],
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">نظرة عامة استراتيجية</h2>
          <p class="text-slate-500 text-sm">مؤشرات الأداء المالي والتشغيلي (Direct View)</p>
        </div>
        <button 
          (click)="generateInsights()"
          [disabled]="isLoadingAI()"
          class="flex items-center gap-2 bg-gradient-to-l from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-70 font-medium shadow-md border border-white/20">
          
          @if (isLoadingAI()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>جاري التحليل...</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            <span>استشارة الذكاء الاصطناعي</span>
          }
        </button>
      </div>

      <!-- AI Insights Box -->
      @if (aiInsight()) {
        <div class="bg-indigo-50 border-r-4 border-indigo-500 p-5 rounded-l-lg shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
               <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-indigo-900">تحليل المساعد الذكي</h3>
              <div class="mt-2 text-sm text-indigo-800 whitespace-pre-line leading-relaxed">
                {{ aiInsight() }}
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Revenue & Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Revenue Card (Strategic Overview) -->
        <div class="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full -translate-x-10 -translate-y-10 opacity-50"></div>
          
          <div class="flex justify-between items-start mb-6 relative z-10">
             <div>
               <h3 class="text-lg font-bold text-slate-800">إجمالي الإيرادات (المشاريع المنجزة)</h3>
               <p class="text-slate-400 text-xs">تحسب فقط من المشاريع التي تم تسليمها بالكامل</p>
             </div>
             
             <!-- Time Filter -->
             <div class="flex bg-slate-100 p-1 rounded-lg">
               <button (click)="setPeriod('day')" [class.bg-white]="period() === 'day'" [class.shadow-sm]="period() === 'day'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-slate-600">يومي</button>
               <button (click)="setPeriod('month')" [class.bg-white]="period() === 'month'" [class.shadow-sm]="period() === 'month'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-slate-600">شهري</button>
               <button (click)="setPeriod('year')" [class.bg-white]="period() === 'year'" [class.shadow-sm]="period() === 'year'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-slate-600">سنوي</button>
               <button (click)="setPeriod('custom')" [class.bg-white]="period() === 'custom'" [class.shadow-sm]="period() === 'custom'" class="px-3 py-1 text-xs font-medium rounded-md transition-all text-slate-600">مخصص</button>
             </div>
          </div>

          <!-- Date Picker for Custom -->
          @if (period() === 'custom') {
            <div class="flex gap-2 mb-4 animate-fade-in relative z-10">
              <input type="date" [(ngModel)]="customStartDate" (change)="updateCustomRange()" class="border border-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
              <span class="text-slate-400 self-center">-</span>
              <input type="date" [(ngModel)]="customEndDate" (change)="updateCustomRange()" class="border border-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          }

          <div class="flex items-end gap-4 relative z-10">
            <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">
              {{ revenueMetrics().total | number }} <span class="text-xl font-medium text-slate-500">ر.س</span>
            </h2>
            
            <div class="flex items-center gap-1 mb-2 px-2 py-1 rounded-md" [ngClass]="revenueMetrics().growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              <svg *ngIf="revenueMetrics().growth >= 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <svg *ngIf="revenueMetrics().growth < 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
              <span class="text-sm font-bold">{{ revenueMetrics().growth | number:'1.0-1' }}%</span>
            </div>
          </div>
          <p class="text-slate-400 text-xs mt-2 relative z-10">مقارنة بالفترة السابقة ({{ revenueMetrics().previousTotal | number }} ر.س)</p>
        </div>

        <!-- Cash Flow Panel -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
           <!-- Decor -->
           <div class="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

           <div>
             <h3 class="text-lg font-bold text-white/90 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
               التدفق النقدي
             </h3>
             <div class="mt-6 space-y-4">
               <div class="flex justify-between items-end border-b border-white/10 pb-2">
                 <span class="text-slate-400 text-xs">المدفوع اليوم</span>
                 <span class="text-xl font-bold text-green-400">{{ dataService.cashFlow().paidToday | number }} ر.س</span>
               </div>
               <div class="flex justify-between items-end border-b border-white/10 pb-2">
                 <span class="text-slate-400 text-xs">الإجمالي المحصل</span>
                 <span class="text-base font-medium">{{ dataService.cashFlow().paidTotal | number }} ر.س</span>
               </div>
               <div class="flex justify-between items-end">
                 <span class="text-slate-400 text-xs">المتبقي للتحصيل</span>
                 <span class="text-base font-medium text-orange-300">{{ dataService.cashFlow().remaining | number }} ر.س</span>
               </div>
             </div>
           </div>
           
           <div class="mt-4">
             <div class="flex justify-between text-xs mb-1 text-slate-400">
               <span>نسبة التحصيل</span>
               <span>{{ dataService.cashFlow().collectionRate | number:'1.0-0' }}%</span>
             </div>
             <div class="w-full bg-white/10 rounded-full h-1.5">
               <div class="bg-indigo-500 h-1.5 rounded-full" [style.width.%]="dataService.cashFlow().collectionRate"></div>
             </div>
           </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Project Counter (Pipeline) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            عداد المشاريع
            <span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{{ dataService.projectCounts().total }}</span>
          </h3>
          
          <div class="grid grid-cols-2 gap-3">
            
            <!-- New Requests (Prominent) -->
            <div class="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center cursor-pointer hover:bg-purple-100 transition-colors col-span-2 flex items-center justify-between px-6">
               <div class="flex items-center gap-3">
                 <span class="relative flex h-3 w-3">
                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                 </span>
                 <div class="text-sm font-bold text-purple-700">طلبات جديدة</div>
               </div>
               <div class="text-2xl font-bold text-purple-700">{{ dataService.projectCounts().newRequest }}</div>
            </div>

            <!-- In Progress -->
            <div class="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center cursor-pointer hover:bg-blue-100 transition-colors">
              <div class="text-2xl font-bold text-blue-700">{{ dataService.projectCounts().inProgress }}</div>
              <div class="text-xs font-medium text-blue-600 mt-1">قيد التنفيذ</div>
            </div>

            <!-- Waiting Client -->
            <div class="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center cursor-pointer hover:bg-amber-100 transition-colors">
              <div class="text-2xl font-bold text-amber-700">{{ dataService.projectCounts().waitingClient }}</div>
              <div class="text-xs font-medium text-amber-600 mt-1">بانتظار العميل</div>
            </div>

            <!-- Internal Review -->
            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center cursor-pointer hover:bg-indigo-100 transition-colors">
              <div class="text-2xl font-bold text-indigo-700">{{ dataService.projectCounts().internalReview }}</div>
              <div class="text-xs font-medium text-indigo-600 mt-1">مراجعة داخلية</div>
            </div>

             <!-- Revisions -->
            <div class="p-4 rounded-xl bg-red-50 border border-red-100 text-center cursor-pointer hover:bg-red-100 transition-colors">
              <div class="text-2xl font-bold text-red-700">{{ dataService.projectCounts().revisions }}</div>
              <div class="text-xs font-medium text-red-600 mt-1">تعديلات</div>
            </div>

             <!-- Completed -->
            <div class="p-4 rounded-xl bg-green-50 border border-green-100 text-center cursor-pointer hover:bg-green-100 transition-colors col-span-2 flex items-center justify-between px-6">
              <div class="text-xs font-medium text-green-600">تم التسليم</div>
              <div class="text-2xl font-bold text-green-700">{{ dataService.projectCounts().completed }}</div>
            </div>
             
             <!-- Cancelled -->
             <div class="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center col-span-2">
               <span class="text-xs text-slate-400">ملغاة: {{ dataService.projectCounts().cancelled }}</span>
             </div>

          </div>
        </div>

        <!-- Chart Section -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-slate-800">مخطط نمو الإيرادات</h3>
             <span class="text-xs text-slate-400">آخر 12 شهر</span>
          </div>
          <app-revenue-chart [data]="chartData"></app-revenue-chart>
        </div>
      </div>
    </div>
  `
})
export class DashboardViewComponent {
  dataService = inject(MockDataService);
  geminiService = inject(GeminiService);
  
  chartData = this.dataService.getRevenueHistoryData();
  aiInsight = signal<string>('');
  isLoadingAI = signal<boolean>(false);

  // Filter Logic
  period = signal<'day' | 'month' | 'year' | 'custom'>('month');
  customStartDate = '';
  customEndDate = '';

  revenueMetrics = computed(() => {
    return this.dataService.calculateRevenue(this.period(), this.customStartDate, this.customEndDate);
  });

  setPeriod(p: 'day' | 'month' | 'year' | 'custom') {
    this.period.set(p);
  }

  updateCustomRange() {
    // Trigger computed update via date changes if needed, 
    // simply changing the inputs bound to ngModel will trigger CD eventually
    // but here we rely on the signal computation in calculateRevenue
    this.period.set('custom'); // Ensure custom is active
  }

  async generateInsights() {
    this.isLoadingAI.set(true);
    const insights = await this.geminiService.getStrategicInsight(
      { 
        revenueMetrics: this.revenueMetrics(),
        cashFlow: this.dataService.cashFlow() 
      },
      this.dataService.projectCounts()
    );
    this.aiInsight.set(insights);
    this.isLoadingAI.set(false);
  }
}