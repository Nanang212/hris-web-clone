import { createFileRoute } from '@tanstack/react-router'

import { SkeletonPattern } from '@/shared/components/skeleton-pattern'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

export const Route = createFileRoute('/(app)/leave/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-full'>
      <Tabs defaultValue='account' className='w-full'>
        <TabsList variant='segmented' className='w-full justify-start'>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='password'>Password</TabsTrigger>
        </TabsList>
        <TabsContent value='account'>Make changes to your account here.</TabsContent>
        <TabsContent value='password'>Change your password here.</TabsContent>
      </Tabs>
    </div>
  )
}
