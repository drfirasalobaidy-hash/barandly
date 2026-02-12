import { Component, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, Project } from '../../services/mock-data.service';

@Component({
  selector: 'app-designer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col md:flex-row gap-0 md:gap-6 bg-[#f8fafc] md:p-6 overflow-hidden font-sans relative md:static">
      
      <!-- 1. SIDEBAR (Tasks List) -->
      <div 
         class="w-full md:w-[360px] flex-shrink-0 bg-transparent flex flex-col h-full overflow-hidden z-10 relative transition-all"
         [ngClass]="currentProject() ? 'hidden md:flex' : 'flex'">
         
         <!-- Header -->
         <div class="mb-4 px-1">
            <div class="flex justify-between items-center mb-4">
               <h2 class="text-xl font-black text-slate-800 tracking-tight">مهامي ({{ myProjects().length }})</h2>
               <div class="flex gap-2">
                  <button class="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-lg transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></button>
               </div>
            </div>

            <!-- Tabs -->
            <div class="flex p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100">
               <button (click)="filterMode.set('all')" 
                  class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  [ngClass]="filterMode() === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'">
                  الكل
               </button>
               <button (click)="filterMode.set('urgent')" 
                  class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  [ngClass]="filterMode() === 'urgent' ? 'bg-white text-red-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:text-red-600 hover:bg-slate-50'">
                  <span>عاجل</span>
                  <span class="text-xs">🔥</span>
               </button>
            </div>
         </div>

         <!-- List Cards -->
         <div class="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar pb-10">
            @for (project of filteredProjects(); track project.id) {
               <div (click)="selectProject(project.id)"
                    class="group relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer bg-white"
                    [ngClass]="currentProject()?.id === project.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 z-10' : 'border-transparent shadow-sm hover:shadow-md hover:-translate-y-1'">
                  
                  <!-- High Badge -->
                  @if(project.priority === 'High') {
                    <span class="absolute top-6 left-6 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md tracking-widest border border-red-100">HIGH</span>
                  }

                  <!-- Content -->
                  <div class="mt-4 mb-4">
                     <h3 class="font-black text-slate-800 text-lg leading-snug mb-1 text-right">{{ project.title }}</h3>
                     <p class="text-xs text-slate-400 font-bold text-right">{{ project.clientName }}</p>
                  </div>

                  <!-- Footer -->
                  <div class="flex items-center justify-between border-t border-slate-50 pt-4">
                     <!-- Checklist Progress -->
                     <div class="flex items-center gap-2">
                        <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div class="h-full bg-green-500 rounded-full" [style.width.%]="(getCompletedChecklist(project)/project.checklist.length)*100"></div>
                        </div>
                        <span class="text-[10px] font-bold text-slate-400">{{ getCompletedChecklist(project) }}/{{ project.checklist.length }}</span>
                     </div>

                     <!-- Late Status -->
                     <div class="flex items-center gap-1.5 font-bold text-xs" 
                        [ngClass]="getDaysRemaining(project.deliveryDate) < 0 ? 'text-red-500' : 'text-slate-400'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>{{ getCountdown(project.deliveryDate) }}</span>
                     </div>
                  </div>
                  
                  <!-- Active Indicator Line -->
                  @if(currentProject()?.id === project.id) {
                     <div class="absolute left-0 top-8 bottom-8 w-1 bg-indigo-500 rounded-r-full"></div>
                  }
               </div>
            }
         </div>
      </div>

      <!-- 2. MAIN WORKSPACE (Deep Work) -->
      <!-- Fixed on mobile to cover list -->
      <div 
         class="flex-1 bg-white md:rounded-[2.5rem] shadow-xl border border-white flex flex-col overflow-hidden transition-all bg-white"
         [ngClass]="currentProject() ? 'fixed inset-0 z-50 md:static md:z-auto' : 'hidden md:flex relative'">
         
        @if (currentProject(); as p) {
           <div class="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              
              <!-- LEFT COLUMN: Details & Timer (60%) -->
              <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-gradient-to-br from-slate-50/50 to-white">
                 
                 <!-- Mobile Back Button -->
                 <div class="md:hidden mb-6 flex items-center">
                    <button (click)="clearSelection()" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                      <span class="text-sm font-bold">العودة</span>
                    </button>
                 </div>

                 <!-- Top Header Block -->
                 <div class="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                    <div>
                       <div class="flex items-center gap-2 mb-3">
                          <span class="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-indigo-200 shadow-lg">{{ p.status }}</span>
                          <span class="text-slate-400 text-xs font-bold">تسليم: {{ p.deliveryDate }}</span>
                       </div>
                       <h1 class="text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-3 max-w-lg">{{ p.title }}</h1>
                       <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-black border-2 border-white shadow-sm">{{ p.clientName.charAt(0) }}</div>
                          <span class="text-sm font-bold text-slate-600">{{ p.clientName }}</span>
                       </div>
                    </div>

                    <!-- Large Timer -->
                    <div class="text-center group cursor-pointer self-center md:self-start" (click)="toggleTimer(p.id)">
                       <div class="w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl mb-3 group-hover:scale-105 group-active:scale-95"
                          [ngClass]="p.isTimerRunning ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-200' : 'bg-slate-900 shadow-slate-200'">
                          @if(p.isTimerRunning) { 
                             <svg class="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 
                          } @else { 
                             <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> 
                          }
                       </div>
                       <div class="text-3xl font-mono font-black text-slate-800 tracking-tighter">{{ p.actualHours }}<span class="text-sm text-slate-400 ml-1 font-sans font-bold">س</span></div>
                       <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">وقت العمل</div>
                    </div>
                 </div>

                 <!-- Description Box -->
                 <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                    <h3 class="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 relative z-10">
                       <span class="w-2 h-2 rounded-full bg-indigo-500"></span> تفاصيل المشروع
                    </h3>
                    <p class="text-slate-600 text-sm leading-8 font-medium relative z-10">{{ p.description || 'لا يوجد وصف متاح لهذا المشروع، يرجى التواصل مع المدير.' }}</p>
                 </div>

                 <!-- Checklist -->
                  <div class="space-y-4">
                    <div class="flex justify-between items-end px-2">
                       <h3 class="text-sm font-black text-slate-900">قائمة المهام</h3>
                       <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">{{ getCompletedChecklist(p) }} من {{ p.checklist.length }}</span>
                    </div>
                    @if(p.checklist.length > 0) {
                       @for (item of p.checklist; track item.id) {
                          <div (click)="toggleChecklist(p.id, item.id)" 
                             class="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none group bg-white hover:border-indigo-100"
                             [ngClass]="item.isCompleted ? 'border-transparent bg-green-50/50' : 'border-transparent shadow-sm'">
                             <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
                                [ngClass]="item.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-300 group-hover:border-indigo-400'">
                                <svg class="w-4 h-4 text-white" [class.opacity-0]="!item.isCompleted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                             </div>
                             <span class="text-sm font-bold transition-colors" [ngClass]="item.isCompleted ? 'text-green-800 line-through decoration-2 decoration-green-300/50' : 'text-slate-700'">{{ item.text }}</span>
                          </div>
                       }
                    } @else {
                       <div class="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                          <span class="text-slate-300 font-bold text-sm">القائمة فارغة</span>
                       </div>
                    }
                  </div>
              </div>

              <!-- RIGHT COLUMN: Delivery & Chat (40%) -->
              <div class="w-full md:w-[420px] bg-white border-t md:border-t-0 md:border-r border-slate-100 flex flex-col h-1/2 md:h-full shadow-[0_0_50px_-15px_rgba(0,0,0,0.05)] z-20 relative">
                 
                 <!-- 1. Delivery Section (Fixed Top) -->
                 <div class="p-8 pb-4 shrink-0 bg-white z-10">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">تسليم الملفات</h3>
                    <div class="flex gap-4">
                       <!-- Final Button -->
                       <button (click)="triggerUpload(p.id, 'final')" class="flex-1 aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-green-500 hover:bg-green-50/50 transition-all group active:scale-95">
                          <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-green-200">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span class="text-sm font-bold text-slate-700 group-hover:text-green-700">نهائي (Final)</span>
                       </button>

                       <!-- Concept Button -->
                       <button (click)="triggerUpload(p.id, 'concept')" class="flex-1 aspect-square bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group active:scale-95">
                          <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-indigo-200">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <span class="text-sm font-bold text-slate-700 group-hover:text-indigo-700">مسودة (Concept)</span>
                       </button>
                    </div>
                 </div>

                 <!-- 2. Chat Header Divider -->
                 <div class="px-8 py-2 flex items-center gap-4 bg-white z-10">
                    <div class="h-px bg-slate-100 flex-1"></div>
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">المحادثة المباشرة</span>
                    <div class="h-px bg-slate-100 flex-1"></div>
                 </div>

                 <!-- 3. Chat Messages (Flex Grow + Scroll) -->
                 <div class="flex-1 flex flex-col min-h-0 bg-slate-50/50 relative">
                    <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth">
                       @if (p.messages.length === 0) {
                          <div class="h-full flex flex-col items-center justify-center opacity-40">
                             <span class="text-xs text-slate-400 font-bold">لا توجد رسائل سابقة</span>
                          </div>
                       }
                       @for (msg of p.messages; track msg.id) {
                          <div class="flex w-full animate-fade-in" [ngClass]="msg.senderId === 'u3' ? 'justify-end' : 'justify-start'">
                             <div class="max-w-[85%] flex flex-col gap-1" [ngClass]="msg.senderId === 'u3' ? 'items-end' : 'items-start'">
                                <div class="px-4 py-2 text-xs font-bold leading-relaxed shadow-sm"
                                   [ngClass]="msg.senderId === 'u3' 
                                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                                      : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none'">
                                   @if(msg.text) { <p>{{ msg.text }}</p> }
                                   @if (msg.attachment) {
                                      <div class="flex items-center gap-2 mt-1 p-1.5 rounded-lg bg-black/10">
                                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                                         <span>{{ msg.attachment.name }}</span>
                                      </div>
                                   }
                                </div>
                                <span class="text-[9px] text-slate-300 font-bold px-1">{{ msg.timestamp | date:'shortTime' }}</span>
                             </div>
                          </div>
                       }
                    </div>

                    <!-- 4. Input Area (Fixed Bottom) -->
                    <div class="p-4 bg-white border-t border-slate-100 shrink-0 z-20">
                       <div class="flex items-center gap-2 bg-slate-100 rounded-2xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all border border-transparent focus-within:border-indigo-200 focus-within:bg-white">
                          <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage(p.id)" placeholder="اكتب ردك هنا..." class="flex-1 bg-transparent border-none text-sm font-medium py-2.5 px-2 focus:outline-none placeholder:text-slate-400 text-slate-700">
                          <button (click)="sendMessage(p.id)" [disabled]="!newMessage.trim()" class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none">
                             <svg class="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                          </button>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        } @else {
           <!-- Empty State -->
           <div class="h-full flex flex-col items-center justify-center text-slate-300 bg-white">
              <div class="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                 <svg class="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <h2 class="text-2xl font-black text-slate-400 mb-2">مساحة الإبداع</h2>
              <p class="text-sm font-bold text-slate-300">اختر مشروعاً للبدء</p>
           </div>
        }
      </div>

      <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)">
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DesignerDashboardComponent {
  dataService = inject(MockDataService);
  
  selectedProjectId = signal<string | null>(null);
  filterMode = signal<'all' | 'urgent'>('all');
  newMessage = '';
  pendingUploadType: 'concept' | 'final' | null = null;
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  currentProject = computed(() => {
    const id = this.selectedProjectId();
    if (!id) return null;
    return this.dataService.projects().find(p => p.id === id) || null;
  });

  myProjects = computed(() => {
    return this.dataService.projects().filter(p => p.assigneeId === 'u3');
  });

  filteredProjects = computed(() => {
    const all = this.myProjects();
    if (this.filterMode() === 'urgent') {
      return all.filter(p => p.priority === 'High' || this.getDaysRemaining(p.deliveryDate) <= 2);
    }
    return all;
  });

  constructor() {
    effect(() => {
      const _ = this.currentProject()?.messages.length;
      setTimeout(() => {
        if (this.chatContainer) {
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        }
      }, 50);
    });
  }

  selectProject(id: string) {
    this.selectedProjectId.set(id);
  }

  clearSelection() {
    this.selectedProjectId.set(null);
  }

  toggleTimer(projectId: string) {
    this.dataService.toggleTimer(projectId);
  }

  toggleChecklist(projectId: string, itemId: string) {
    this.dataService.toggleChecklistItem(projectId, itemId);
  }

  sendMessage(projectId: string) {
    if (this.newMessage.trim()) {
      this.dataService.addMessage(projectId, this.newMessage, 'u3'); 
      this.newMessage = '';
    }
  }

  triggerUpload(projectId: string, type: 'concept' | 'final') {
    this.pendingUploadType = type;
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const project = this.currentProject();
    
    if (file && project && this.pendingUploadType) {
       this.dataService.addMessage(project.id, '', 'u3', { 
         name: file.name, 
         type: this.pendingUploadType 
       });
       this.pendingUploadType = null;
       event.target.value = '';
    }
  }

  getDaysRemaining(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getCountdown(dateStr: string): string {
    const days = this.getDaysRemaining(dateStr);
    if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
    if (days === 0) return 'اليوم!';
    return `باقي ${days} يوم`;
  }

  getCompletedChecklist(p: Project): number {
    return p.checklist.filter(c => c.isCompleted).length;
  }
}