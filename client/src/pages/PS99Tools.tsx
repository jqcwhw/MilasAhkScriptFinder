import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Trophy, TrendingUp, Users, Clock, Award, Coins, Gem, ArrowLeft, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { ClanData, ClanBattleData, RAPItem } from "@shared/schema";

export default function PS99Tools() {
  const [selectedClan, setSelectedClan] = useState<string>("");
  const [clanSearchInput, setClanSearchInput] = useState<string>("");
  const [rapSearchQuery, setRapSearchQuery] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [existsType, setExistsType] = useState<string>("Pet");
  const [existsId, setExistsId] = useState<string>("");
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

  const { data: collectionsData, isLoading: isLoadingCollections } = useQuery<{ status: string; data: string[] }>({
    queryKey: ["/api/ps99/collections"],
    staleTime: 600000,
  });

  const { data: collectionItems, isLoading: isLoadingCollectionItems } = useQuery<{ status: string; data: any[] }>({
    queryKey: [`/api/ps99/collection/${encodeURIComponent(selectedCollection)}`],
    enabled: selectedCollection.length > 0,
  });

  const { data: existsResult, isLoading: isLoadingExists, refetch: refetchExists } = useQuery<{ status: string; data: { exists: boolean; item?: any } }>({
    queryKey: [`/api/ps99/exists?type=${existsType}&id=${encodeURIComponent(existsId)}`],
    enabled: false,
  });

  const handleClanSearch = () => {
    if (clanSearchInput.trim()) {
      setSelectedClan(clanSearchInput.trim());
      refetchClan();
    }
  };

  const formatNumber = (num: number): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return "0";
    }
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

  const handleExistsCheck = () => {
    if (!existsId.trim()) {
      toast({
        title: "Missing ID",
        description: "Please enter a pet or item ID to check.",
        variant: "destructive",
      });
      return;
    }
    refetchExists();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold" data-testid="text-ps99-title">Pet Simulator 99 Tools</h1>
              <p className="text-muted-foreground mt-2">
                Real-time clan tracking, RAP checker, and more powered by Big Games API
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Data
          </Badge>
        </div>

        <Tabs defaultValue="clans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-1">
            <TabsTrigger value="clans" data-testid="tab-clans" className="flex-1 min-w-0">
              <Trophy className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Clan Tracker</span>
              <span className="sm:hidden">Clans</span>
            </TabsTrigger>
            <TabsTrigger value="rap" data-testid="tab-rap" className="flex-1 min-w-0">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">RAP</span>
              <span className="sm:hidden">RAP</span>
            </TabsTrigger>
            <TabsTrigger value="battle" data-testid="tab-battle" className="flex-1 min-w-0">
              <Award className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Battle</span>
              <span className="sm:hidden">Battle</span>
            </TabsTrigger>
            <TabsTrigger value="collections" data-testid="tab-collections" className="flex-1 min-w-0">
              <Package className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Collections</span>
              <span className="sm:hidden">Items</span>
            </TabsTrigger>
            <TabsTrigger value="lookup" data-testid="tab-lookup" className="flex-1 min-w-0">
              <CheckCircle className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Lookup</span>
              <span className="sm:hidden">Find</span>
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
                        <p className="font-bold text-lg flex items-center gap-1">
                          {formatNumber(clanBattle.data.GoalDiamonds)} <Gem className="w-4 h-4" />
                        </p>
                      </div>
                    </div>

                    {clanBattle.data.Clans && clanBattle.data.Clans.length > 0 && (
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
                    )}

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

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Collections</CardTitle>
                <CardDescription>
                  Browse all available collections like Pets, Eggs, Items, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCollections ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {collectionsData?.data?.map((collection: string) => (
                      <Button
                        key={collection}
                        variant={selectedCollection === collection ? "default" : "outline"}
                        onClick={() => setSelectedCollection(collection)}
                        className="h-12"
                        data-testid={`button-collection-${collection.toLowerCase()}`}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {collection}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedCollection && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCollection} Collection</CardTitle>
                  <CardDescription>
                    Items in the {selectedCollection} collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCollectionItems ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {collectionItems?.data?.slice(0, 100).map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                            data-testid={`collection-item-${index}`}
                          >
                            <div>
                              <p className="font-semibold">{item.configData?.id || item.id || `Item ${index + 1}`}</p>
                              {item.configData?.category && (
                                <Badge variant="secondary" className="mt-1">
                                  {item.configData.category}
                                </Badge>
                              )}
                            </div>
                            {item.value && (
                              <div className="text-right">
                                <p className="font-bold flex items-center gap-1">
                                  <Coins className="w-4 h-4 text-yellow-500" />
                                  {formatNumber(item.value)}
                                </p>
                                <p className="text-xs text-muted-foreground">Value</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {collectionItems?.data && collectionItems.data.length > 100 && (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            Showing first 100 items of {collectionItems.data.length} total
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lookup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Item Existence Checker</CardTitle>
                <CardDescription>
                  Check if a specific pet, item, or other game object exists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                      value={existsType}
                      onChange={(e) => setExistsType(e.target.value)}
                      data-testid="select-exists-type"
                    >
                      <option value="Pet">Pet</option>
                      <option value="Egg">Egg</option>
                      <option value="Charm">Charm</option>
                      <option value="Enchant">Enchant</option>
                      <option value="Potion">Potion</option>
                      <option value="Fruit">Fruit</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Ultimate">Ultimate</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Item ID</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter item ID (e.g., Huge Cupcake)"
                        value={existsId}
                        onChange={(e) => setExistsId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleExistsCheck()}
                        data-testid="input-exists-id"
                      />
                      <Button onClick={handleExistsCheck} data-testid="button-check-exists">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Check
                      </Button>
                    </div>
                  </div>
                </div>

                {isLoadingExists && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}

                {existsResult?.data && (
                  <div className="mt-4 p-4 rounded-lg border" data-testid="exists-result">
                    {existsResult.data.exists ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Item Exists!</span>
                        </div>
                        {existsResult.data.item && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Item Details:</p>
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                              {Object.entries(existsResult.data.item).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{key}:</span>
                                  <span className="text-sm text-muted-foreground">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold">Item Not Found</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
