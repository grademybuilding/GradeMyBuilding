import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicHeader } from "@/components/Layout/PublicHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Calendar, Home, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface SearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  year_built: number;
  square_footage: number;
  inspection: {
    id: string;
    inspection_date: string;
    final_grade_letter: string;
    final_grade_numeric: number;
    excellent_count: number;
    very_good_count: number;
    good_count: number;
    poor_count: number;
    replace_count: number;
  };
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [gradeFilter, setGradeFilter] = useState(searchParams.get('grade') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (address || city || state || propertyType || gradeFilter) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [address, city, state, propertyType, gradeFilter]);

  const performSearch = async () => {
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (address) params.append('address', address);
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (propertyType) params.append('property_type', propertyType);
    if (gradeFilter) params.append('min_grade', gradeFilter);

    setSearchParams(params);

    try {
      const { data, error } = await supabase.functions.invoke('search-buildings', {
        body: Object.fromEntries(params)
      });

      if (error) throw error;

      setResults(data.results || []);
      setTotalResults(data.pagination?.total || 0);
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A+': 'bg-emerald-500',
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500',
    };
    return gradeColors[grade] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-background via-background to-muted/20 py-12 border-b relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Search Building Grades
            </h1>
            <p className="text-lg text-muted-foreground">
              Find inspection grades for buildings in your area
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-5xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Search Filters
            </CardTitle>
            <CardDescription>
              Enter an address or use filters to find building inspection grades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter building address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+ and above</SelectItem>
                  <SelectItem value="A">A and above</SelectItem>
                  <SelectItem value="B">B and above</SelectItem>
                  <SelectItem value="C">C and above</SelectItem>
                  <SelectItem value="D">D and above</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(address || city || state || propertyType || gradeFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddress('');
                  setCity('');
                  setState('');
                  setPropertyType('');
                  setGradeFilter('');
                  setSearchParams(new URLSearchParams());
                  setResults([]);
                  setSearched(false);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Found {totalResults} {totalResults === 1 ? 'property' : 'properties'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{result.address}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {result.city}, {result.state} {result.zip_code}
                        </CardDescription>
                      </div>
                      <div className={`${getGradeColor(result.inspection.final_grade_letter)} text-white rounded-lg px-3 py-1 font-bold text-xl flex-shrink-0`}>
                        {result.inspection.final_grade_letter}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Grade Score:</span>
                      <span className="font-semibold">{result.inspection.final_grade_numeric.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Inspected: {format(new Date(result.inspection.inspection_date), 'MMM d, yyyy')}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-4 w-4" />
                      {result.property_type} • {result.square_footage?.toLocaleString()} sq ft
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{result.inspection.excellent_count}</div>
                          <div className="text-muted-foreground">Excellent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">{result.inspection.good_count}</div>
                          <div className="text-muted-foreground">Good</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{result.inspection.replace_count}</div>
                          <div className="text-muted-foreground">Replace</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start your search</h3>
            <p className="text-muted-foreground">Enter an address or use filters to find building grades</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
