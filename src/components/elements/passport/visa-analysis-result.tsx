"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Clock, 
  DollarSign, 
  MapPin, 
  Plane,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lightbulb,
  Info
} from "lucide-react";

interface VisaData {
  originCountry: string;
  destinationCountry: string;
  visaRequirement: string;
  stayDuration: string;
  requirements: string[];
  documentsNeeded: string[];
  applicationProcess: {
    whereToApply: string;
    processingTime: string;
    cost: string;
    validity: string;
  };
  tips: string[];
  additionalInfo: string;
  officialLink: string | null;
}

interface VisaAnalysisResultProps {
  visaData: VisaData;
}

export function VisaAnalysisResult({ visaData }: VisaAnalysisResultProps) {
  const getVisaRequirementColor = (requirement: string) => {
    const lowerReq = requirement.toLowerCase();
    if (lowerReq.includes('visa-free') || lowerReq.includes('sin visa')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (lowerReq.includes('visa on arrival') || lowerReq.includes('visa a la llegada')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (lowerReq.includes('evisa') || lowerReq.includes('e-visa')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (lowerReq.includes('visa required') || lowerReq.includes('visa requerida')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getVisaRequirementIcon = (requirement: string) => {
    const lowerReq = requirement.toLowerCase();
    if (lowerReq.includes('visa-free') || lowerReq.includes('sin visa')) {
      return <CheckCircle className="h-4 w-4" />;
    } else if (lowerReq.includes('visa on arrival') || lowerReq.includes('visa a la llegada')) {
      return <AlertCircle className="h-4 w-4" />;
    } else if (lowerReq.includes('evisa') || lowerReq.includes('e-visa')) {
      return <FileText className="h-4 w-4" />;
    } else if (lowerReq.includes('visa required') || lowerReq.includes('visa requerida')) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Visa Requirement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Resumen de Requisitos de Visa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {visaData.originCountry} → {visaData.destinationCountry}
              </h3>
              <p className="text-sm text-muted-foreground">
                Duración máxima de estadía: {visaData.stayDuration}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`${getVisaRequirementColor(visaData.visaRequirement)} flex items-center gap-1`}
            >
              {getVisaRequirementIcon(visaData.visaRequirement)}
              {visaData.visaRequirement}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {visaData.requirements && visaData.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Requisitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {visaData.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Documents Needed */}
      {visaData.documentsNeeded && visaData.documentsNeeded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos Necesarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {visaData.documentsNeeded.map((document, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{document}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Application Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Proceso de Solicitud
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Dónde Solicitar
              </h4>
              <p className="text-sm">{visaData.applicationProcess.whereToApply}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Tiempo de Procesamiento
              </h4>
              <p className="text-sm">{visaData.applicationProcess.processingTime}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Costo
              </h4>
              <p className="text-sm">{visaData.applicationProcess.cost}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Validez
              </h4>
              <p className="text-sm">{visaData.applicationProcess.validity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      {visaData.tips && visaData.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Consejos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {visaData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {visaData.additionalInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {visaData.additionalInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Official Link */}
      {visaData.officialLink && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => window.open(visaData.officialLink!, '_blank')}
              className="w-full flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Información Oficial
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
