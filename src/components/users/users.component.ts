import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockDataService, User } from '../../services/mock-data.service';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
           <h2 class="text-2xl font-bold text-slate-800">إدارة الفريق والصلاحيات</h2>
           <p class="text-slate-500 text-sm">متابعة الأداء والتحكم في الوصول (RBAC)</p>
        </div>
        <button (click)="showForm = !showForm" class="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200">
           @if (!showForm) {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>إضافة موظف جديد</span>
           } @else {
             <span>إلغاء</span>
           }
        </button>
      </div>

      <!-- Add User Form -->
      @if (showForm) {
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
              <input type="text" formControlName="name" class="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 border outline-none transition-all" placeholder="مثال: أحمد محمد">
            </div>
             <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
              <input type="email" formControlName="email" class="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 border outline-none transition-all" placeholder="name@company.com">
            </div>
             <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">الدور الوظيفي</label>
              <select formControlName="role" class="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 border outline-none transition-all bg-white">
                <option value="Project Manager">مدير مشاريع (PM)</option>
                <option value="Designer">مصمم (Designer)</option>
              </select>
            </div>
            <button type="submit" [disabled]="userForm.invalid" class="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium shadow-md shadow-indigo-200">
              إنشاء الحساب
            </button>
          </form>
        </div>
      }

      <!-- User List -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th class="px-6 py-4">الموظف</th>
                <th class="px-6 py-4">الدور</th>
                <th class="px-6 py-4">الحالة</th>
                <th class="px-6 py-4 text-center">مشاريع منجزة</th>
                <th class="px-6 py-4 text-center">نسبة الالتزام</th>
                <th class="px-6 py-4 text-center">متوسط وقت الإنجاز</th>
                <th class="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (user of dataService.users(); track user.id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img [src]="user.avatar" class="w-10 h-10 rounded-full border border-slate-100" alt="avatar">
                      <div>
                        <div class="font-bold text-slate-800">{{ user.name }}</div>
                        <div class="text-xs text-slate-400">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                    [ngClass]="{
                      'bg-purple-50 text-purple-700 border-purple-100': user.role === 'CEO',
                      'bg-blue-50 text-blue-700 border-blue-100': user.role === 'Project Manager',
                      'bg-pink-50 text-pink-700 border-pink-100': user.role === 'Designer'
                    }">
                      @if(user.role === 'CEO') { مدير عام }
                      @if(user.role === 'Project Manager') { مدير مشاريع }
                      @if(user.role === 'Designer') { مصمم }
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    @if (user.status === 'Active') {
                      <span class="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> نشط
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <span class="w-2 h-2 rounded-full bg-slate-300"></span> معطل
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-center font-bold text-slate-700">
                    {{ user.metrics.completedProjects }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                         <div class="w-16 bg-slate-100 rounded-full h-1.5">
                            <div class="bg-indigo-500 h-1.5 rounded-full" [style.width.%]="user.metrics.commitmentRate"></div>
                         </div>
                         <span class="text-xs font-bold">{{ user.metrics.commitmentRate }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-slate-500">
                    {{ user.metrics.avgCompletionTime }} يوم
                  </td>
                  <td class="px-6 py-4 text-left">
                    @if (user.role !== 'CEO') {
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="toggleStatus(user.id)" class="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm" title="تغيير الحالة">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                        </button>
                        <button (click)="deleteUser(user.id)" class="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-600 hover:border-red-200 transition-all shadow-sm" title="حذف">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UsersViewComponent {
  dataService = inject(MockDataService);
  fb = inject(FormBuilder);
  showForm = false;

  userForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Project Manager', Validators.required]
  });

  onSubmit() {
    if (this.userForm.valid) {
      const formVal = this.userForm.value;
      const newUser: User = {
        id: 'u' + Date.now(),
        name: formVal.name,
        email: formVal.email,
        role: formVal.role,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        metrics: { completedProjects: 0, commitmentRate: 100, avgCompletionTime: 0 }
      };
      this.dataService.addUser(newUser);
      this.userForm.reset({ role: 'Project Manager' });
      this.showForm = false;
    }
  }

  toggleStatus(id: string) {
    this.dataService.toggleUserStatus(id);
  }

  deleteUser(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      this.dataService.removeUser(id);
    }
  }
}