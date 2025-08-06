import { Routes } from '@angular/router';
import { Chat } from './app/pages/chat/chat';

export const appRoutes: Routes = [
    { path: '', component: Chat },
    { path: 'chat', component: Chat },
    { path: '**', redirectTo: '' }
];
