import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { UserProfile, UserRole } from '../../types';
import { useAppStore } from '../../lib/store';
import { usePlatformStore } from '../../services/store';
import { getActiveSession, signInUser, signOutUser, signUpUser } from '../../services/supabaseAuth';
import { supabase } from '../../lib/supabase';

interface AuthContextType { user: UserProfile | null; isLoading: boolean; login:(email:string,password?:string,role?:UserRole)=>Promise<void>; register:(email:string,password:string,companyName:string,phone:string)=>Promise<void>; logout:()=>Promise<void>; switchDemoRole:(role:'SELLER'|'ADMIN')=>void }
const AuthContext=createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
  const {currentUser,setCurrentUser,setCurrentSeller}=useAppStore();
  const [isLoading,setIsLoading]=useState(true);
  const apply=(data:Awaited<ReturnType<typeof getActiveSession>>)=>{setCurrentUser(data?.user||null);setCurrentSeller(data?.seller||null);usePlatformStore.getState().setCurrentSeller(data?.seller||null)};
  useEffect(()=>{let active=true;const demoRole=sessionStorage.getItem('shipfaster_demo_role') as 'SELLER'|'ADMIN'|null;if(demoRole){switchDemoRole(demoRole);setIsLoading(false)}else{getActiveSession().then(d=>{if(active)apply(d)}).catch(()=>{if(active)apply(null)}).finally(()=>{if(active)setIsLoading(false)})}const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'&&!sessionStorage.getItem('shipfaster_demo_role'))apply(null)});return()=>{active=false;subscription.unsubscribe()}},[]);
  const login=async(email:string,password='')=>{setIsLoading(true);try{apply(await signInUser(email,password));toast.success('Signed in securely')}catch(e){toast.error(e instanceof Error?e.message:'Sign in failed');throw e}finally{setIsLoading(false)}};
  const register=async(email:string,password:string,companyName:string,phone:string)=>{setIsLoading(true);try{let data=await signUpUser(email,password,companyName,phone);await supabase.auth.refreshSession();data=(await getActiveSession())||data;apply(data);toast.success('Account created. Complete verification to activate shipping.')}catch(e){toast.error(e instanceof Error?e.message:'Registration failed');throw e}finally{setIsLoading(false)}};
  const logout=async()=>{sessionStorage.removeItem('shipfaster_demo_role');await signOutUser();apply(null)};
  const switchDemoRole=(role:'SELLER'|'ADMIN')=>{
    sessionStorage.setItem('shipfaster_demo_role',role);
    const seller={id:'32d724db-23c4-4cba-a76f-f78e4022194e',company_name:'Apex Retail Demo',brand_name:'Apex Retail',pan:'DEMO00000X',status:'ACTIVE' as const,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    const user:UserProfile=role==='ADMIN'
      ? {id:'00000000-0000-0000-0000-000000000002',email:'admin@shipfaster.demo',name:'Platform Admin',role:'PLATFORM_ADMIN',is_active:true}
      : {id:'00000000-0000-0000-0000-000000000001',email:'seller@shipfaster.demo',name:'Demo Seller',role:'OWNER',seller_id:seller.id,is_active:true};
    setCurrentUser(user);setCurrentSeller(role==='SELLER'?seller:null);usePlatformStore.getState().setCurrentSeller(role==='SELLER'?seller:null);
    toast.success(`${role==='ADMIN'?'Admin':'Seller'} demo opened`);
  };
  return <AuthContext.Provider value={{user:currentUser,isLoading,login,register,logout,switchDemoRole}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);
