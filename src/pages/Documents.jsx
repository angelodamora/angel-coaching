import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Plus, Download, Trash2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Documents() {
  const queryClient = useQueryClient();
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    visible_to: ["admin"]
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
    initialData: [],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      let fileUrl = "";
      if (selectedFile) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });
        fileUrl = uploadResult.file_url;
      }
      
      await base44.entities.Document.create({
        ...data,
        file_url: fileUrl,
        file_size: selectedFile?.size || 0,
        file_type: selectedFile?.type || ""
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsAddingDocument(false);
      setFormData({ title: "", description: "", category: "other", visible_to: ["admin"] });
      setSelectedFile(null);
      toast.success("Documento caricato con successo!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId) => base44.entities.Document.delete(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("Documento eliminato");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Seleziona un file");
      return;
    }
    uploadMutation.mutate(formData);
  };

  const categoryColors = {
    marketing: "bg-purple-100 text-purple-700",
    legal: "bg-red-100 text-red-700",
    training: "bg-blue-100 text-blue-700",
    guidelines: "bg-green-100 text-green-700",
    other: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Documenti
              </h1>
              <p className="text-gray-600">Gestisci i documenti della piattaforma</p>
            </div>
            <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Carica Nuovo Documento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Titolo *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Es. Linee guida per coach"
                    />
                  </div>

                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrivi il contenuto del documento..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="legal">Legale</SelectItem>
                        <SelectItem value="training">Formazione</SelectItem>
                        <SelectItem value="guidelines">Linee Guida</SelectItem>
                        <SelectItem value="other">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>File *</Label>
                    <Input
                      type="file"
                      required
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        File selezionato: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? "Caricamento..." : "Carica Documento"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {documents.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nessun documento
                  </h3>
                  <p className="text-gray-500">
                    Inizia caricando il primo documento
                  </p>
                </CardContent>
              </Card>
            ) : (
              documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{doc.title}</h3>
                            <Badge className={categoryColors[doc.category] + " mt-1"}>
                              {doc.category}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      {doc.file_size && (
                        <p className="text-xs text-gray-500 mb-3">
                          Dimensione: {(doc.file_size / 1024).toFixed(2)} KB
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.file_url, '_blank')}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Scarica
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}