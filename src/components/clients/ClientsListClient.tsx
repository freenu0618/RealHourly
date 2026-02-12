"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/ui/fade-in";

type Client = {
  id: string;
  name: string;
  projectCount?: number;
};

export function ClientsListClient() {
  const t = useTranslations("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setClients(data);
    } catch {
      toast.error(t("title"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("created"));
      setName("");
      setAddOpen(false);
      fetchClients();
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editClient || !name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${editClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("updated"));
      setName("");
      setEditClient(null);
      fetchClients();
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("deleted"));
      fetchClients();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button
            onClick={() => { setName(""); setAddOpen(true); }}
            className="gap-2 rounded-xl"
          >
            <Plus className="size-4" />
            {t("addClient")}
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <FadeIn>
          <Card className="mx-auto max-w-md">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-3 size-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">{t("noClients")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("noClientsDesc")}
              </p>
              <Button
                className="mt-4 gap-2 rounded-xl"
                onClick={() => { setName(""); setAddOpen(true); }}
              >
                <Plus className="size-4" />
                {t("addClient")}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client, i) => (
            <FadeIn key={client.id} delay={i * 0.05}>
              <Card className="group transition-all hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{client.name}</p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => {
                        setEditClient(client);
                        setName(client.name);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("addClient")}</DialogTitle>
            <DialogDescription>{t("subtitle")}</DialogDescription>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("addClient")}
            </Button>
            <Button onClick={handleAdd} disabled={submitting || !name.trim()}>
              {t("addClient")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={(o) => !o && setEditClient(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("editClient")}</DialogTitle>
            <DialogDescription>{t("subtitle")}</DialogDescription>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClient(null)}>
              {t("editClient")}
            </Button>
            <Button onClick={handleEdit} disabled={submitting || !name.trim()}>
              {t("editClient")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
