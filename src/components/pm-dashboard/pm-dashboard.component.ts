import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockDataService, Project, ProjectStatus, User } from '../../services/mock-data.service';

@Component({
  selector: 'app-pm-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col animate-fade-in relative bg-slate-50/50">
      <!-- Top Bar -->
      <div class="flex flex-col gap-4 mb-6 px-1">
        
        <!-- Header & Actions -->
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">إدارة العمليات</h2>
            <p class="text-slate-500 text-sm">لوحة تحكم مركزية لمتابعة سير العمل</p>
          </div>
          <div class="flex gap-3">
             <!-- Notification Button -->
             <div class="relative">
               <button (click)="toggleNotifications()" class="bg-white text-slate-600 border border-slate-200 w-10 h-10 rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                 @if (unreadCount() > 0) {
                   <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[18px] text-center">
                     {{ unreadCount() }}
                   </span>
                 }
               </button>

               <!-- Notification Dropdown Panel -->
               @if (showNotificationsPanel()) {
                 <div class="absolute left-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-left">
                   <div class="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                     <h3 class="font-bold text-sm text-slate-800">التحديثات الأخيرة</h3>
                     <button (click)="markAllRead()" class="text-xs text-indigo-600 hover:text-indigo-800">تحديد كمقروء</button>
                   </div>
                   <div class="max-h-80 overflow-y-auto custom-scrollbar">
                     @if (dataService.notifications().length === 0) {
                       <div class="p-6 text-center text-slate-400 text-xs">لا توجد إشعارات جديدة</div>
                     }
                     @for (notif of dataService.notifications(); track notif.id) {
                       <div class="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                         <div class="mt-1 flex-shrink-0">
                           @if (notif.type === 'Alert') {
                             <span class="w-2 h-2 rounded-full bg-red-500 block"></span>
                           } @else if (notif.type === 'Success') {
                             <span class="w-2 h-2 rounded-full bg-green-500 block"></span>
                           } @else {
                             <span class="w-2 h-2 rounded-full bg-blue-500 block"></span>
                           }
                         </div>
                         <div>
                           <p class="text-xs text-slate-800 font-medium line-clamp-2">{{ notif.message }}</p>
                           <span class="text-[10px] text-slate-400">{{ notif.timestamp | date:'shortTime' }}</span>
                         </div>
                       </div>
                     }
                   </div>
                 </div>
                 <!-- Backdrop to close -->
                 <div class="fixed inset-0 z-40 bg-transparent" (click)="showNotificationsPanel.set(false)"></div>
               }
             </div>

             <button (click)="openAddModal()" class="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
               طلب جديد
            </button>
            
            <button (click)="showTeamReport.set(true)" class="bg-white text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 text-sm font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               الفريق
            </button>
          </div>
        </div>

        <!-- Toolbar: Filters & View Switcher -->
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          
          <!-- Filters -->
          <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            <button (click)="filterMode.set('all')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              [ngClass]="filterMode() === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
              الكل
            </button>
            <button (click)="filterMode.set('high_priority')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap"
              [ngClass]="filterMode() === 'high_priority' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
              <span class="w-2 h-2 rounded-full bg-red-500"></span> عالية الأولوية
            </button>
            <button (click)="filterMode.set('late')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap"
              [ngClass]="filterMode() === 'late' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              متأخرة
            </button>
             <button (click)="filterMode.set('my_projects')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap"
              [ngClass]="filterMode() === 'my_projects' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
              مشاريعي
            </button>
          </div>

          <!-- View Switcher -->
          <div class="flex bg-slate-100 p-1 rounded-lg">
            <button (click)="viewMode.set('board')" class="p-1.5 rounded-md transition-all" [ngClass]="viewMode() === 'board' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'" title="عرض اللوحة">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </button>
            <button (click)="viewMode.set('list')" class="p-1.5 rounded-md transition-all" [ngClass]="viewMode() === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'" title="عرض القائمة">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative">
        
        <!-- MODE 1: Kanban Board -->
        @if (viewMode() === 'board') {
          <div class="h-full overflow-x-auto pb-4 custom-scrollbar px-1">
            <div class="flex gap-4 min-w-max h-full">
              @for (col of columns; track col.id) {
                <div class="w-80 flex-shrink-0 flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200/60 overflow-hidden">
                  
                  <!-- Column Header -->
                  <div class="p-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" [ngClass]="col.color"></div>
                      <h3 class="font-bold text-slate-700 text-sm">{{ col.name }}</h3>
                    </div>
                    <span class="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-200">
                      {{ getFilteredProjectsByStatus(col.id).length }}
                    </span>
                  </div>

                  <!-- Cards Area -->
                  <div class="p-2 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    @for (project of getFilteredProjectsByStatus(col.id); track project.id) {
                      <div 
                        (click)="openProjectDetails(project)"
                        class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative border-l-4 cursor-pointer"
                        [ngClass]="getAlertClass(project)">
                        
                        <!-- Priority Badge & Revenue -->
                        <div class="flex justify-between items-start mb-2">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                            [ngClass]="{
                              'bg-red-50 text-red-600': project.priority === 'High',
                              'bg-amber-50 text-amber-600': project.priority === 'Medium',
                              'bg-blue-50 text-blue-600': project.priority === 'Low'
                            }">
                            {{ project.priority }}
                          </span>
                          <span class="text-xs font-mono text-slate-500 font-semibold">{{ project.revenue | number }} ر.س</span>
                        </div>

                        <h4 class="font-bold text-slate-800 text-sm mb-1 leading-snug">{{ project.title }}</h4>
                        <p class="text-xs text-slate-500 mb-3 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {{ project.clientName }}
                        </p>

                        <!-- Stats Row -->
                        <div class="flex items-center justify-between pt-3 border-t border-slate-50">
                          <!-- Assignee -->
                          <div class="flex items-center gap-2">
                            @if (project.assigneeId) {
                              <img [src]="getAssigneeAvatar(project.assigneeId)" class="w-6 h-6 rounded-full border border-white" title="المصمم المسؤول">
                              <span class="text-[10px] text-slate-500 font-medium">{{ getAssigneeName(project.assigneeId) }}</span>
                            } @else {
                              <div class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">?</div>
                              <span class="text-[10px] text-slate-400">غير معين</span>
                            }
                          </div>

                          <!-- Move Action (Dropdown) -->
                          <div (click)="$event.stopPropagation()" class="relative group/action">
                            <select 
                                [ngModel]="project.status"
                                (ngModelChange)="updateStatus(project.id, $event)"
                                class="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded px-2 py-1 pr-5 cursor-pointer hover:border-indigo-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                                @for (c of columns; track c.id) {
                                  <option [value]="c.id">{{ c.name }}</option>
                                }
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-500">
                                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } 
        
        <!-- MODE 2: List View (Table) -->
        @else {
          <div class="h-full overflow-y-auto custom-scrollbar px-1 pb-4">
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table class="w-full text-right text-sm">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th class="p-4 w-4"></th> <!-- Status Color Strip -->
                    <th class="p-4">المشروع / العميل</th>
                    <th class="p-4 text-center">الحالة (نقل الطلب)</th>
                    <th class="p-4">المسؤول</th>
                    <th class="p-4">الأولوية</th>
                    <th class="p-4 text-center">الموعد</th>
                    <th class="p-4 text-center">القيمة</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (project of allFilteredProjects(); track project.id) {
                    <tr class="hover:bg-indigo-50/30 transition-colors group">
                      <td class="p-0">
                         <div class="h-full w-1.5 mx-auto rounded-r" [ngClass]="getAlertClass(project).replace('border-l-4', '').replace('border-l-', 'bg-').replace('bg-slate-200', 'bg-slate-300')"></div>
                      </td>
                      <td class="p-4 cursor-pointer" (click)="openProjectDetails(project)">
                        <div class="font-bold text-slate-800 text-sm mb-0.5 hover:text-indigo-600">{{ project.title }}</div>
                        <div class="text-xs text-slate-500 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {{ project.clientName }}
                        </div>
                      </td>
                      <td class="p-4 text-center">
                         <div class="relative inline-block w-40">
                            <select 
                                [ngModel]="project.status"
                                (ngModelChange)="updateStatus(project.id, $event)"
                                class="w-full appearance-none pl-2 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                                [ngClass]="getStatusBadgeClass(project.status)">
                                @for (c of columns; track c.id) {
                                  <option [value]="c.id" class="text-slate-800 bg-white font-medium">{{ c.name }}</option>
                                }
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                         </div>
                      </td>
                      <td class="p-4">
                         @if (project.assigneeId) {
                           <div class="flex items-center gap-2">
                             <img [src]="getAssigneeAvatar(project.assigneeId)" class="w-6 h-6 rounded-full border border-slate-100">
                             <span class="text-xs text-slate-600 font-medium">{{ getAssigneeName(project.assigneeId) }}</span>
                           </div>
                         } @else {
                           <span class="text-xs text-slate-400 italic">-- غير معين --</span>
                         }
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold"
                          [ngClass]="{
                            'text-red-600 bg-red-50': project.priority === 'High',
                            'text-amber-600 bg-amber-50': project.priority === 'Medium',
                            'text-blue-600 bg-blue-50': project.priority === 'Low'
                          }">
                          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                            'bg-red-500': project.priority === 'High',
                            'bg-amber-500': project.priority === 'Medium',
                            'bg-blue-500': project.priority === 'Low'
                          }"></span>
                          {{ project.priority }}
                        </span>
                      </td>
                      <td class="p-4 text-center">
                        <div class="flex flex-col items-center">
                          <span class="text-xs font-mono font-medium text-slate-600">{{ project.deliveryDate }}</span>
                          @let days = getDaysRemaining(project.deliveryDate);
                          <span class="text-[10px]" [ngClass]="days < 0 ? 'text-red-500 font-bold' : 'text-slate-400'">
                             {{ days < 0 ? 'متأخر ' + Math.abs(days) + ' يوم' : 'باقي ' + days + ' يوم' }}
                          </span>
                        </div>
                      </td>
                      <td class="p-4 text-center">
                        <span class="font-mono text-xs font-bold text-slate-700">{{ project.revenue | number }}</span>
                      </td>
                    </tr>
                  }
                  @if (allFilteredProjects().length === 0) {
                    <tr>
                      <td colspan="7" class="p-10 text-center text-slate-400 text-sm">
                        لا توجد مشاريع تطابق الفلتر الحالي.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- Add Project Modal -->
      @if (showAddModal()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
           <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="showAddModal.set(false)"></div>
           <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in border border-slate-200 flex flex-col max-h-[90vh]">
              <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                 <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <div class="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                   </div>
                   إضافة طلب جديد
                 </h3>
                 <button (click)="showAddModal.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
              </div>
              <div class="p-6 overflow-y-auto">
                 <form [formGroup]="addProjectForm" (ngSubmit)="submitNewProject()" class="space-y-5">
                   
                   <!-- Title -->
                   <div>
                     <label class="block text-sm font-bold text-slate-700 mb-1.5">عنوان المشروع <span class="text-red-500">*</span></label>
                     <input formControlName="title" type="text" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" placeholder="مثال: تصميم هوية بصرية لشركة...">
                   </div>
                   
                   <!-- Description -->
                   <div>
                     <label class="block text-sm font-bold text-slate-700 mb-1.5">وصف المشروع / ملاحظات <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                     <textarea formControlName="description" rows="3" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" placeholder="تفاصيل إضافية..."></textarea>
                   </div>
                   
                   <!-- Grid 1 -->
                   <div class="grid grid-cols-2 gap-4">
                     <div>
                       <label class="block text-sm font-bold text-slate-700 mb-1.5">اسم العميل <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                       <div class="relative">
                         <span class="absolute right-3 top-3 text-slate-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                         </span>
                         <input formControlName="clientName" type="text" class="w-full border border-slate-200 rounded-xl p-3 pr-9 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" placeholder="اسم العميل">
                       </div>
                     </div>
                     <div>
                       <label class="block text-sm font-bold text-slate-700 mb-1.5">قيمة المشروع <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                       <div class="relative">
                         <span class="absolute right-3 top-3 text-slate-400 text-xs font-bold">ر.س</span>
                         <input formControlName="revenue" type="number" class="w-full border border-slate-200 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" placeholder="0.00">
                       </div>
                     </div>
                   </div>

                   <!-- Grid 2 -->
                   <div class="grid grid-cols-2 gap-4">
                     <div>
                       <label class="block text-sm font-bold text-slate-700 mb-1.5">تاريخ التسليم <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                       <input formControlName="deliveryDate" type="date" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm bg-white">
                     </div>
                     <div>
                       <label class="block text-sm font-bold text-slate-700 mb-1.5">الأولوية</label>
                       <select formControlName="priority" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm bg-white cursor-pointer">
                         <option value="High">🔴 عالية (High)</option>
                         <option value="Medium">🟠 متوسطة (Medium)</option>
                         <option value="Low">🔵 منخفضة (Low)</option>
                       </select>
                     </div>
                   </div>

                    <!-- Assignee -->
                    <div>
                     <label class="block text-sm font-bold text-slate-700 mb-1.5">تعيين مصمم <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                     <select formControlName="assigneeId" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm bg-white cursor-pointer">
                       <option value="">-- بدون تعيين حالياً --</option>
                       @for (designer of detailedDesigners(); track designer.id) {
                         <option [value]="designer.id">
                           {{ designer.name }} (الضغط: {{ designer.metrics.activeLoad }}%)
                         </option>
                       }
                     </select>
                     @if (addProjectForm.get('assigneeId')?.value) {
                       <p class="text-[10px] text-indigo-600 mt-1 flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                         سيتم تحديث نسبة الضغط للمصمم المختار تلقائياً.
                       </p>
                     }
                   </div>

                   <!-- Hours -->
                   <div>
                     <label class="block text-sm font-bold text-slate-700 mb-1.5">الساعات المقدرة <span class="text-slate-400 text-xs font-normal">(اختياري)</span></label>
                     <input formControlName="estimatedHours" type="number" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" placeholder="عدد الساعات">
                   </div>

                   <!-- Actions -->
                   <div class="pt-2 flex gap-3 sticky bottom-0 bg-white border-t border-slate-50 mt-2">
                     <button type="submit" [disabled]="addProjectForm.invalid" class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200">إضافة الطلب</button>
                     <button type="button" (click)="showAddModal.set(false)" class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">إلغاء</button>
                   </div>
                 </form>
              </div>
           </div>
        </div>
      }

      <!-- Team Report Modal -->
      @if (showTeamReport()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center p-4">
           <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="showTeamReport.set(false)"></div>
           <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-fade-in">
              <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 class="text-lg font-bold text-slate-800">تقرير إنتاجية الفريق</h3>
                 <button (click)="showTeamReport.set(false)" class="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
              </div>
              <div class="p-6">
                 <table class="w-full text-right text-sm">
                   <thead>
                     <tr class="text-slate-500 border-b border-slate-100">
                       <th class="pb-3 font-semibold">المصمم</th>
                       <th class="pb-3 font-semibold text-center">المشاريع الحالية</th>
                       <th class="pb-3 font-semibold text-center">ضغط العمل (Load)</th>
                       <th class="pb-3 font-semibold text-center">متوسط الإنجاز</th>
                       <th class="pb-3 font-semibold text-center">نسبة الالتزام</th>
                       <th class="pb-3 font-semibold text-center">الحالة</th>
                     </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-50">
                     @for (designer of detailedDesigners(); track designer.id) {
                       <tr>
                         <td class="py-3 flex items-center gap-2">
                           <img [src]="designer.avatar" class="w-8 h-8 rounded-full">
                           <span class="font-bold text-slate-800">{{ designer.name }}</span>
                         </td>
                         <td class="py-3 text-center font-mono">{{ designer.activeProjectsCount }}</td>
                         <td class="py-3 text-center">
                            <div class="flex items-center justify-center gap-2">
                              <div class="w-16 bg-slate-100 rounded-full h-1.5">
                                <div class="h-1.5 rounded-full" [ngClass]="(designer.metrics.activeLoad || 0) > 70 ? 'bg-red-500' : 'bg-green-500'" [style.width.%]="designer.metrics.activeLoad"></div>
                              </div>
                              <span class="text-xs">{{ designer.metrics.activeLoad }}%</span>
                            </div>
                         </td>
                         <td class="py-3 text-center text-slate-500">{{ designer.metrics.avgCompletionTime }} يوم</td>
                         <td class="py-3 text-center font-bold text-indigo-600">{{ designer.metrics.commitmentRate }}%</td>
                         <td class="py-3 text-center">
                            @if ((designer.metrics.activeLoad || 0) < 50) {
                              <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">متفرغ</span>
                            } @else {
                              <span class="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">مشغول</span>
                            }
                         </td>
                       </tr>
                     }
                   </tbody>
                 </table>
              </div>
           </div>
        </div>
      }

      <!-- Project Detail Slide-over (Right Side) -->
      @if (selectedProject(); as p) {
        <div class="absolute inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" (click)="closeDetails()"></div>
          
          <div class="w-full md:w-[500px] bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right">
            <!-- Header -->
            <div class="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <div class="flex items-center gap-2 mb-1">
                   <span class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">{{ p.status }}</span>
                   @if (isLate(p)) { <span class="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">متأخر</span> }
                </div>
                <h3 class="text-xl font-bold text-slate-800">{{ p.title }}</h3>
                @if (p.description) {
                  <p class="text-sm text-slate-600 mt-1">{{ p.description }}</p>
                }
                <p class="text-slate-500 text-sm mt-1">{{ p.clientName }} • {{ p.revenue | number }} ر.س</p>
              </div>
              <button (click)="closeDetails()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-5 space-y-6">
              
              <!-- 1. Assignment System -->
              <section>
                <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  نظام التعيين الذكي
                </h4>
                
                @if (!p.assigneeId) {
                  <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                    <p class="text-xs text-indigo-800 font-bold mb-2">💡 اقتراح الذكاء الاصطناعي:</p>
                    @let suggested = getSuggestedDesigner();
                    <div class="flex items-center justify-between">
                       <div class="flex items-center gap-2">
                          <img [src]="suggested.avatar" class="w-8 h-8 rounded-full">
                          <div>
                            <div class="text-sm font-bold text-indigo-900">{{ suggested.name }}</div>
                            <div class="text-xs text-indigo-600">
                               ضغط: {{ suggested.metrics.activeLoad }}% | مشاريع: {{ suggested.activeProjectsCount }}
                            </div>
                          </div>
                       </div>
                       <button (click)="assign(p.id, suggested.id)" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">تعيين المقترح</button>
                    </div>
                  </div>
                }

                <div class="space-y-2">
                  <label class="text-xs text-slate-500">اختر مصمماً يدوياً (يعرض: الضغط | المشاريع | الحالة):</label>
                  <select [value]="p.assigneeId || ''" (change)="onAssignChange($event, p.id)" class="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="" disabled>-- غير معين --</option>
                    @for (designer of detailedDesigners(); track designer.id) {
                      <option [value]="designer.id">
                        {{ designer.name }} ({{ designer.metrics.activeLoad }}% | {{ designer.activeProjectsCount }} مشروع | {{ (designer.metrics.activeLoad || 0) < 50 ? 'متفرغ' : 'مشغول' }})
                      </option>
                    }
                  </select>
                </div>
              </section>

              <hr class="border-slate-100">

              <!-- 2. Time Tracking -->
              <section>
                 <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  متابعة الوقت والإنتاجية
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <div class="text-xs text-slate-500 mb-1">المقدر</div>
                    <div class="font-mono font-bold text-slate-800">{{ p.estimatedHours }} س</div>
                  </div>
                   <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center relative overflow-hidden">
                    <div class="text-xs text-slate-500 mb-1">الفعلي</div>
                    <div class="font-mono font-bold" [ngClass]="p.actualHours > p.estimatedHours ? 'text-red-600' : 'text-green-600'">{{ p.actualHours }} س</div>
                    @if (p.isTimerRunning) {
                      <span class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    }
                  </div>
                </div>
                <button (click)="toggleTimer(p.id)" class="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all"
                  [ngClass]="p.isTimerRunning ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'">
                  @if (p.isTimerRunning) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    إيقاف المؤقت
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    بدء العمل
                  }
                </button>
              </section>

               <hr class="border-slate-100">

               <!-- 3. Communication -->
               <section class="flex flex-col h-72">
                 <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  مناقشات المشروع
                </h4>
                <div class="flex-1 bg-slate-50 rounded-lg border border-slate-200 p-3 overflow-y-auto mb-3 space-y-3 custom-scrollbar">
                   @if (p.messages.length === 0) {
                     <div class="text-center text-xs text-slate-400 mt-10">لا توجد رسائل بعد</div>
                   }
                   @for (msg of p.messages; track msg.id) {
                     <div class="flex gap-2 items-start" [ngClass]="{'flex-row-reverse': msg.senderId === 'u2'}"> <!-- u2 is current PM -->
                        <div class="w-6 h-6 rounded-full bg-slate-300 flex-shrink-0"></div>
                        <div class="flex flex-col gap-1 max-w-[80%]">
                           <div class="rounded-lg p-2 text-xs" 
                               [ngClass]="msg.senderId === 'u2' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'">
                            <span [innerHTML]="formatMessage(msg.text)"></span>
                          </div>
                          @if (msg.attachment) {
                            <div class="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 w-fit">
                               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                               {{ msg.attachment.name }}
                            </div>
                          }
                        </div>
                     </div>
                   }
                </div>
                <div class="flex gap-2 items-end bg-white border border-slate-200 rounded-lg p-1">
                   <button (click)="fileInput.click()" class="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="إرفاق ملف">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                   </button>
                   <input #fileInput type="file" class="hidden" (change)="onFileSelected($event, p.id)">
                   
                   <textarea rows="1" [(ngModel)]="newMessage" (keyup.enter)="sendMessage(p.id)" placeholder="اكتب ملاحظة أو توجيه (@للمنشن)..." class="flex-1 bg-transparent text-sm focus:outline-none resize-none py-2 max-h-20"></textarea>
                   
                   <button (click)="sendMessage(p.id)" class="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 mb-0.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                   </button>
                </div>
               </section>

            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-in-right { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class PmDashboardComponent {
  dataService = inject(MockDataService);
  fb = inject(FormBuilder);
  Math = Math; 
  
  // View Control
  viewMode = signal<'board' | 'list'>('board');
  filterMode = signal<'all' | 'high_priority' | 'late' | 'my_projects'>('all');
  
  // Notifications State
  showNotificationsPanel = signal<boolean>(false);
  unreadCount = computed(() => this.dataService.notifications().length); // Simple mock unread count

  columns: {id: ProjectStatus, name: string, color: string}[] = [
    { id: 'New Order', name: 'طلب جديد', color: 'bg-slate-400' },
    { id: 'Brief Review', name: 'مراجعة البريف', color: 'bg-blue-400' },
    { id: 'In Progress', name: 'قيد التنفيذ', color: 'bg-indigo-400' },
    { id: 'Internal Review', name: 'مراجعة داخلية', color: 'bg-purple-400' },
    { id: 'Client Feedback', name: 'بانتظار العميل', color: 'bg-amber-400' },
    { id: 'Revisions', name: 'تعديلات', color: 'bg-red-400' },
    { id: 'Completed', name: 'مكتمل', color: 'bg-green-400' },
  ];

  selectedProject = signal<Project | null>(null);
  showTeamReport = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  
  newMessage = '';
  
  // Add Project Form
  addProjectForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    clientName: [''],
    revenue: [null],
    deliveryDate: [''],
    priority: ['Medium'],
    estimatedHours: [null],
    assigneeId: ['']
  });

  // Computed extended designer stats
  detailedDesigners = computed(() => {
    const projects = this.dataService.projects();
    return this.dataService.users()
      .filter(u => u.role === 'Designer')
      .map(u => {
        const activeCount = projects.filter(p => p.assigneeId === u.id && p.status !== 'Completed' && p.status !== 'Cancelled').length;
        return {
          ...u,
          activeProjectsCount: activeCount
        };
      });
  });

  // --- Filtering Logic ---
  allFilteredProjects = computed(() => {
    const all = this.dataService.projects();
    const filter = this.filterMode();
    
    return all.filter(p => {
      if (filter === 'all') return true;
      if (filter === 'high_priority') return p.priority === 'High';
      if (filter === 'late') return this.isLate(p);
      if (filter === 'my_projects') return p.assigneeId === 'u3'; 
      return true;
    });
  });

  getFilteredProjectsByStatus(status: ProjectStatus) {
    return this.allFilteredProjects().filter(p => p.status === status);
  }

  // --- Status Update (Dropdown) ---
  updateStatus(projectId: string, newStatus: ProjectStatus) {
    this.dataService.updateProjectStatus(projectId, newStatus);
  }

  // --- Notification Logic ---
  toggleNotifications() {
    this.showNotificationsPanel.update(v => !v);
  }

  markAllRead() {
    // In a real app, this would update the backend/service
    // For now, we can just close the panel as a mock action
    this.showNotificationsPanel.set(false);
  }

  // --- Alert System ---
  getDaysRemaining(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getAlertClass(p: Project): string {
    if (p.status === 'Completed' || p.status === 'Cancelled') return 'border-l-slate-200';
    const days = this.getDaysRemaining(p.deliveryDate);
    if (days < 0) return 'border-l-red-500 bg-red-50/10'; // Late
    if (days <= 3) return 'border-l-amber-500 bg-amber-50/10'; // Near
    return 'border-l-green-500'; // Safe
  }

  isLate(p: Project): boolean {
    return this.getDaysRemaining(p.deliveryDate) < 0 && p.status !== 'Completed';
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    switch (status) {
      case 'New Order': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Brief Review': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Internal Review': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Client Feedback': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Revisions': return 'bg-red-50 text-red-700 border-red-100';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  }

  getAssigneeAvatar(id: string): string {
    const u = this.dataService.users().find(user => user.id === id);
    return u ? u.avatar : '';
  }

  getAssigneeName(id: string): string {
    const u = this.dataService.users().find(user => user.id === id);
    return u ? u.name : 'Unknown';
  }

  // --- Detail Slide-over ---
  openProjectDetails(p: Project) {
    this.selectedProject.set(p);
  }

  closeDetails() {
    this.selectedProject.set(null);
  }

  // --- Add Project Logic ---
  openAddModal() {
    this.addProjectForm.reset({ priority: 'Medium', assigneeId: '' });
    this.showAddModal.set(true);
  }

  submitNewProject() {
    if (this.addProjectForm.valid) {
      this.dataService.addNewProject(this.addProjectForm.value);
      this.showAddModal.set(false);
    }
  }

  // --- Actions ---
  getSuggestedDesigner() {
    const designers = this.detailedDesigners();
    return designers.reduce((prev, curr) => 
      (prev.metrics.activeLoad || 0) < (curr.metrics.activeLoad || 0) ? prev : curr
    );
  }

  assign(projectId: string, designerId: string) {
    this.dataService.assignDesigner(projectId, designerId);
  }

  onAssignChange(event: any, projectId: string) {
    this.assign(projectId, event.target.value);
  }

  toggleTimer(projectId: string) {
    this.dataService.toggleTimer(projectId);
  }

  // --- Chat ---
  sendMessage(projectId: string) {
    if (this.newMessage.trim()) {
      this.dataService.addMessage(projectId, this.newMessage, 'u2'); 
      this.newMessage = '';
    }
  }

  onFileSelected(event: any, projectId: string) {
     const file = event.target.files[0];
     if (file) {
        this.dataService.addMessage(projectId, '', 'u2', { name: file.name, type: 'file' });
     }
  }

  formatMessage(text: string): string {
     return text.replace(/@(\w+|[\u0600-\u06FF]+)/g, '<span class="text-indigo-200 font-bold bg-indigo-700 px-1 rounded mx-0.5">@$1</span>');
  }
}