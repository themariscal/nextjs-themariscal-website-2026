"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  BookOpen, 
  Building, 
  Globe, 
  Star,
  ExternalLink,
  Calendar,
  Info
} from "lucide-react";

interface PlaceHistoryData {
  name: string;
  location: string;
  history: string;
  significance: string;
  architecture: string;
  culturalContext: string;
  interestingFacts: string[];
  bestTimeToVisit: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface PlaceHistoryResultProps {
  placeHistory: PlaceHistoryData;
}

export function PlaceHistoryResult({ placeHistory }: PlaceHistoryResultProps) {
  const openInGoogleMaps = () => {
    if (placeHistory.coordinates) {
      const { latitude, longitude } = placeHistory.coordinates;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      const searchQuery = encodeURIComponent(`${placeHistory.name} ${placeHistory.location}`);
      const url = `https://maps.google.com/search/${searchQuery}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-primary">{placeHistory.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{placeHistory.location}</span>
              </div>
            </div>
            <Button
              onClick={openInGoogleMaps}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Maps
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Historia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {placeHistory.history}
          </p>
        </CardContent>
      </Card>

      {/* Significance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Significado Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {placeHistory.significance}
          </p>
        </CardContent>
      </Card>

      {/* Architecture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Arquitectura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {placeHistory.architecture}
          </p>
        </CardContent>
      </Card>

      {/* Cultural Context Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Contexto Cultural
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {placeHistory.culturalContext}
          </p>
        </CardContent>
      </Card>

      {/* Interesting Facts Section */}
      {placeHistory.interestingFacts && placeHistory.interestingFacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Datos Curiosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {placeHistory.interestingFacts.map((fact, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <p className="text-muted-foreground">{fact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Time to Visit Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Mejor Época para Visitar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{placeHistory.bestTimeToVisit}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
