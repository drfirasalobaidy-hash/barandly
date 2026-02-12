import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockDataService, Notification } from '../../services/mock-data.service';

@Component({
  selector: 'app-notifications-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
       <div class="flex justify-between items-center">
        <div>
           <h2 class="text-2xl font-bold text-slate-800">مركز الإشعارات</h2>
           <p class="text-slate-500 text-sm">إرسال التنبيهات والتعاميم الإدارية</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Compose -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 class="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <div class="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
            </div>
            إنشاء إشعار جديد
          </h3>
          <form [formGroup]="notifForm" (ngSubmit)="sendNotif()" class="space-y-5">
             <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">المستلم</label>
              <select formControlName="recipientId" class="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 border bg-white outline-none">
                <option value="ALL">الكل (تعميم جماعي)</option>
                @for (user of dataService.users(); track user.id) {
                  <option [value]="user.id">{{ user.name }} ({{ user.role }})</option>
                }
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">نوع الإشعار</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors w-full justify-center">
                  <input type="radio" formControlName="type" value="Info" class="text-indigo-600 focus:ring-indigo-500"> معلومة
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors w-full justify-center">
                  <input type="radio" formControlName="type" value="Alert" class="text-red-600 focus:ring-red-500"> تنبيه
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors w-full justify-center">
                  <input type="radio" formControlName="type" value="Success" class="text-green-600 focus:ring-green-500"> نجاح
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">نص الرسالة</label>
              <textarea formControlName="message" rows="4" class="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm p-3 border outline-none" placeholder="اكتب نص الإشعار هنا..."></textarea>
            </div>

             <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">قنوات الإرسال</label>
              <div class="flex flex-wrap gap-2">
                 <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    النظام الداخلي (افتراضي)
                 </span>
                 <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed">
                    البريد الإلكتروني
                 </span>
                 <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed">
                    تنبيهات الجوال (Push)
                 </span>
              </div>
            </div>

            <button type="submit" [disabled]="notifForm.invalid" class="w-full bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 font-bold shadow-lg shadow-slate-200">
              إرسال الإشعار
            </button>
          </form>
        </div>

        <!-- History -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div class="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 class="font-bold text-slate-700">سجل النشاطات والتنبيهات الأخيرة</h3>
            <span class="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">آخر 24 ساعة</span>
          </div>
          <div class="flex-1 overflow-y-auto p-0 scroll-smooth">
             @for (notif of dataService.notifications(); track notif.id) {
               <div class="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 group">
                 <div class="flex-shrink-0 mt-1">
                   @if (notif.type === 'Alert') {
                     <div class="p-3 bg-red-50 text-red-600 rounded-full border border-red-100">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                     </div>
                   } @else if (notif.type === 'Success') {
                      <div class="p-3 bg-green-50 text-green-600 rounded-full border border-green-100">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                     </div>
                   } @else {
                      <div class="p-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                     </div>
                   }
                 </div>
                 <div class="flex-1">
                   <div class="flex justify-between items-start">
                     <p class="text-sm font-bold text-slate-800" [ngClass]="{
                        'text-red-700': notif.type === 'Alert',
                        'text-green-700': notif.type === 'Success',
                        'text-blue-700': notif.type === 'Info'
                     }">
                        @if(notif.type === 'Alert') { تنبيه هام }
                        @if(notif.type === 'Success') { عملية ناجحة }
                        @if(notif.type === 'Info') { معلومة }
                     </p>
                     <span class="text-xs text-slate-400 font-mono">{{ notif.timestamp | date:'shortTime' }}</span>
                   </div>
                   <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ notif.message }}</p>
                   <div class="flex items-center mt-3">
                     <span class="text-xs text-slate-400 ml-2">إلى:</span>
                     <span class="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 border border-slate-200">
                       {{ notif.recipientId === 'ALL' ? 'الجميع' : 'مستخدم #' + notif.recipientId }}
                     </span>
                   </div>
                 </div>
               </div>
             }
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsViewComponent {
  dataService = inject(MockDataService);
  fb = inject(FormBuilder);

  notifForm: FormGroup = this.fb.group({
    recipientId: ['ALL', Validators.required],
    type: ['Info', Validators.required],
    message: ['', Validators.required]
  });

  sendNotif() {
    if (this.notifForm.valid) {
      const formVal = this.notifForm.value;
      const newNotif: Notification = {
        id: 'n' + Date.now(),
        type: formVal.type,
        message: formVal.message,
        recipientId: formVal.recipientId,
        timestamp: Date.now()
      };
      this.dataService.addNotification(newNotif);
      this.notifForm.controls['message'].reset();
    }
  }
}