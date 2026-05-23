"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ShipItPack } from "@/lib/schemas/ship-it"

import {
  AdsTab,
  DistributionTab,
  InterviewTab,
  LandingTab,
  MitigationTab,
  OutreachTab,
} from "./ship-it-tabs"

type Props = { pack: ShipItPack }

// Renders the full Ship It Pack as five tabs. Tab labels are uppercase
// Bungee for the arcade feel; each pane brings its own Copy-to-clipboard
// affordance + Sonner toast.
export function ShipItPackView({ pack }: Props) {
  return (
    <Tabs defaultValue="landing" className="w-full">
      <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="landing" className="font-display tracking-widest">
          Landing
        </TabsTrigger>
        <TabsTrigger value="ads" className="font-display tracking-widest">
          Ads
        </TabsTrigger>
        <TabsTrigger value="interview" className="font-display tracking-widest">
          Interview
        </TabsTrigger>
        <TabsTrigger value="outreach" className="font-display tracking-widest">
          Outreach
        </TabsTrigger>
        <TabsTrigger
          value="distribution"
          className="font-display tracking-widest"
        >
          Distribution
        </TabsTrigger>
        <TabsTrigger
          value="mitigation"
          className="font-display tracking-widest"
        >
          Mitigation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="landing" className="mt-4">
        <LandingTab landing={pack.landing_page} />
      </TabsContent>
      <TabsContent value="ads" className="mt-4">
        <AdsTab ads={pack.ad_concepts} />
      </TabsContent>
      <TabsContent value="interview" className="mt-4">
        <InterviewTab script={pack.interview_script} />
      </TabsContent>
      <TabsContent value="outreach" className="mt-4">
        <OutreachTab dm={pack.outreach_dm} />
      </TabsContent>
      <TabsContent value="distribution" className="mt-4">
        <DistributionTab post={pack.distribution_post} />
      </TabsContent>
      <TabsContent value="mitigation" className="mt-4">
        <MitigationTab mitigation={pack.mitigation} />
      </TabsContent>
    </Tabs>
  )
}
