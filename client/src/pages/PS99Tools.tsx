import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Trophy, TrendingUp, Users, Clock, Award, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClanData, ClanBattleData, RAPItem } from "@shared/schema";

export default function PS99Tools() {
  const [selectedClan, setSelectedClan] = useState<string>("");
  const [clanSearchInput, setClanSearchInput] = useState<string>("");
  const [rapSearchQuery, setRapSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const { data: topClans, isLoading: isLoadingTopClans } = useQuery<{status: string, data: ClanData[]}>({
    queryKey: ["/api/ps99/clans?page=1&pageSize=20&sort=Points&sortOrder=desc"],
    refetchInterval: 60000,
  });

  const { data: clanBattle, isLoading: isLoadingBattle } = useQuery<ClanBattleData>({
    queryKey: ["/api/ps99/clan-battle"],
    refetchInterval: 30000,
  });

  const { data: selectedClanData, isLoading: isLoadingClan, refetch: refetchClan } = useQuery<{status: string, data: ClanData}>({
    queryKey: [`/api/ps99/clan/${encodeURIComponent(selectedClan)}`],
    enabled: selectedClan.length > 0,
  });

  const { data: rapData, isLoading: isLoadingRAP } = useQuery<{ status: string; data: RAPItem[] }>({
    queryKey: ["/api/ps99/rap"],
    staleTime: 300000,
  });

  const handleClanSearch = () => {
    if (clanSearchInput.trim()) {
      setSelectedClan(clanSearchInput.trim());
      refetchClan();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toString();
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getBattleTimeRemaining = (): string => {
    if (!clanBattle?.data?.EndTime) return "No active battle";
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = clanBattle.data.EndTime - now;
    
    if (remaining <= 0) return "Battle ended";
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredRAP = rapData?.data?.filter(item => {
    if (!rapSearchQuery) return true;
    return item.configData.id.toLowerCase().includes(rapSearchQuery.toLowerCase());
  }).slice(0, 50) || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold" data-testid="text-ps99-title">Pet Simulator 99 Tools</h1>
            <p className="text-muted-foreground mt-2">
              Real-time clan tracking, RAP checker, and more powered by Big Games API
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Data
          </Badge>
        </div>

        <Tabs defaultValue="clans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clans" data-testid="tab-clans">
              <Trophy className="w-4 h-4 mr-2" />
              Clan Tracker
            </TabsTrigger>
            <TabsTrigger value="rap" data-testid="tab-rap">
              <TrendingUp className="w-4 h-4 mr-2" />
              RAP Checker
            </TabsTrigger>
            <TabsTrigger value="battle" data-testid="tab-battle">
              <Award className="w-4 h-4 mr-2" />
              Clan Battle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clan Search</CardTitle>
                <CardDescription>
                  Search for any clan by name to view detailed statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter clan name..."
                    value={clanSearchInput}
                    onChange={(e) => setClanSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleClanSearch()}
                    data-testid="input-clan-search"
                  />
                  <Button onClick={handleClanSearch} data-testid="button-search-clan">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {isLoadingClan && (
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}

                {selectedClanData?.data && (
                  <div className="mt-4 space-y-4" data-testid="clan-details">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-bold text-lg">{selectedClanData.data.Name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Points</p>
                        <p className="font-bold text-lg text-primary">
                          {formatNumber(selectedClanData.data.Points)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="font-bold text-lg">
                          {selectedClanData.data.Members?.length || 0} / {selectedClanData.data.MemberCapacity}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-bold text-lg">{selectedClanData.data.CountryCode}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Gold</p>
                          <p className="font-bold">{selectedClanData.data.GoldMedals || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Silver</p>
                          <p className="font-bold">{selectedClanData.data.SilverMedals || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Bronze</p>
                          <p className="font-bold">{selectedClanData.data.BronzeMedals || 0}</p>
                        </div>
                      </div>
                    </div>

                    {selectedClanData.data.Desc && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{selectedClanData.data.Desc}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 20 Clans</CardTitle>
                <CardDescription>
                  Live leaderboard updated every minute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {isLoadingTopClans ? (
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topClans?.data?.map((clan: ClanData, index: number) => (
                        <div
                          key={clan.Name}
                          className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                          onClick={() => {
                            setSelectedClan(clan.Name);
                            setClanSearchInput(clan.Name);
                          }}
                          data-testid={`clan-item-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{clan.Name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>{clan.Members} members</span>
                                <span>•</span>
                                <span>{clan.CountryCode}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatNumber(clan.Points)}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RAP Checker</CardTitle>
                <CardDescription>
                  Recent Average Price for pets and items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search pets or items..."
                  value={rapSearchQuery}
                  onChange={(e) => setRapSearchQuery(e.target.value)}
                  data-testid="input-rap-search"
                />

                <ScrollArea className="h-[500px]">
                  {isLoadingRAP ? (
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredRAP.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`rap-item-${index}`}
                        >
                          <div>
                            <p className="font-semibold">{item.configData.id}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                              {item.configData.pt === 1 && (
                                <Badge className="text-xs bg-yellow-500">Golden</Badge>
                              )}
                              {item.configData.pt === 2 && (
                                <Badge className="text-xs bg-purple-500">Rainbow</Badge>
                              )}
                              {item.configData.sh && (
                                <Badge className="text-xs bg-blue-500">Shiny</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg flex items-center gap-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              {formatNumber(item.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">RAP Value</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Clan Battle</CardTitle>
                <CardDescription>
                  Current clan battle information and participating clans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBattle ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : clanBattle?.data ? (
                  <div className="space-y-4" data-testid="battle-details">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time Remaining
                        </p>
                        <p className="font-bold text-lg text-primary">
                          {getBattleTimeRemaining()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Goal
                        </p>
                        <p className="font-bold text-lg">
                          {formatNumber(clanBattle.data.GoalDiamonds)} 💎
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Participating Clans:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {clanBattle.data.Clans.map((clan: string) => (
                          <Badge
                            key={clan}
                            variant="outline"
                            className="justify-center py-2 cursor-pointer hover-elevate"
                            onClick={() => {
                              setSelectedClan(clan);
                              setClanSearchInput(clan);
                            }}
                          >
                            {clan}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Started: {formatTimestamp(clanBattle.data.StartTime)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No active clan battle at the moment
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
