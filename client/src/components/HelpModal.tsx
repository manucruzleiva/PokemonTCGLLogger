import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Download, Upload, FileText, AlertCircle } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Guía: Cómo Exportar e Importar Logs de Partidas</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="export">Exportar Logs</TabsTrigger>
            <TabsTrigger value="import">Importar a la App</TabsTrigger>
            <TabsTrigger value="tips">Consejos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>¿Qué son los Logs de Partidas?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Los logs de partidas son archivos de texto que contienen un registro detallado de todo lo que ocurre durante una partida de Pokémon TCG Live. Incluyen información como:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Nombres de los jugadores</li>
                  <li>Pokémon utilizados durante la partida</li>
                  <li>Cartas jugadas y efectos activados</li>
                  <li>Resultado final y número de turnos</li>
                  <li>Cronología completa de eventos</li>
                </ul>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Importante</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Los logs solo se generan automáticamente en la versión de escritorio de Pokémon TCG Live. La versión móvil no permite exportar logs directamente.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Desktop Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Escritorio (Recomendado)</span>
                    <Badge variant="default">Disponible</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Paso 1: Abrir Pokémon TCG Live</h4>
                      <p className="text-sm text-muted-foreground">
                        Inicia la aplicación de escritorio de Pokémon TCG Live en tu PC.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Paso 2: Jugar una Partida</h4>
                      <p className="text-sm text-muted-foreground">
                        Completa una partida normal (clasificatoria, casual o contra amigos).
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Paso 3: Acceder al Historial</h4>
                      <p className="text-sm text-muted-foreground">
                        Ve al menú principal → "Historial de Partidas" o "Match History".
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Paso 4: Exportar Log</h4>
                      <p className="text-sm text-muted-foreground">
                        Busca la partida y haz clic en "Exportar Log" o "Export Game Log".
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Paso 5: Guardar Archivo</h4>
                      <p className="text-sm text-muted-foreground">
                        El archivo .txt se guardará en tu carpeta de Descargas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5" />
                    <span>Móvil</span>
                    <Badge variant="secondary">Limitado</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">Limitación de la App Móvil</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-200">
                          La versión móvil de Pokémon TCG Live no incluye la funcionalidad de exportar logs automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Alternativas para Móvil:</h4>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">Opción 1: Registro Manual</h5>
                      <p className="text-sm text-muted-foreground">
                        Toma capturas de pantalla durante la partida y crea un log manual con la información básica.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">Opción 2: Usar PC</h5>
                      <p className="text-sm text-muted-foreground">
                        Juega ocasionalmente en la versión de escritorio para obtener logs automáticos.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">Opción 3: Sincronización</h5>
                      <p className="text-sm text-muted-foreground">
                        Si tienes ambas versiones, los datos se sincronizan entre PC y móvil.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Importar Logs a Pokémon Trainer Academia</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Desde Móvil:</h4>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">1. Abrir el Menú</h5>
                      <p className="text-sm text-muted-foreground">
                        Toca el botón de menú hamburguesa (☰) en la esquina superior izquierda.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">2. Ir a Subir Partida</h5>
                      <p className="text-sm text-muted-foreground">
                        Selecciona "Subir Partida" en el menú de navegación.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">3. Pegar el Log</h5>
                      <p className="text-sm text-muted-foreground">
                        Copia el contenido del archivo de log y pégalo en el área de texto.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Desde Escritorio:</h4>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">1. Abrir la App</h5>
                      <p className="text-sm text-muted-foreground">
                        Usa la barra de navegación superior para ir a "Subir Partida".
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">2. Cargar Archivo</h5>
                      <p className="text-sm text-muted-foreground">
                        Abre el archivo .txt de log y copia todo el contenido.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">3. Procesar</h5>
                      <p className="text-sm text-muted-foreground">
                        Pega el contenido y haz clic en "Procesar Partida".
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Download className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">Procesamiento Automático</h4>
                      <p className="text-sm text-green-700 dark:text-green-200">
                        La aplicación extraerá automáticamente: nombres de jugadores, Pokémon utilizados, ganador, duración y estadísticas detalladas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Consejos Generales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">✅ Verificar Logs</h4>
                    <p className="text-sm text-muted-foreground">
                      Asegúrate de que el log contenga toda la partida desde el inicio hasta el final.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">✅ Formato Correcto</h4>
                    <p className="text-sm text-muted-foreground">
                      Los logs deben estar en formato .txt sin modificaciones.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">✅ Partidas Completas</h4>
                    <p className="text-sm text-muted-foreground">
                      Solo sube logs de partidas terminadas, no de partidas abandonadas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solución de Problemas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">❌ Log No Se Procesa</h4>
                    <p className="text-sm text-muted-foreground">
                      Verifica que copiaste todo el contenido y que la partida esté completa.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">❌ Información Faltante</h4>
                    <p className="text-sm text-muted-foreground">
                      Algunos logs antiguos pueden tener formato diferente. Contacta asistencia si persiste.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-1">❌ Error de Duplicado</h4>
                    <p className="text-sm text-muted-foreground">
                      La app previene logs duplicados. Si aparece este error, la partida ya existe.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>¿Necesitas Más Ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Si tienes problemas específicos o preguntas adicionales, puedes solicitar asistencia directa.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onClose();
                    // Trigger assistance modal from parent component
                  }}
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Solicitar Asistencia Personal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Cerrar Guía</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}