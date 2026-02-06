"use client";

import { AppLayout } from "@/components/app-layout";
import { Settings, ChevronRight, CreditCard, FileCheck, Award, LogOut, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { GSIStore, User } from "@/lib/store";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const [showQr, setShowQr] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      GSIStore.setCurrentUser(null);
      toast.success("Déconnexion réussie");
      router.push("/login");
    } catch (err: any) {
      toast.error("Erreur de déconnexion");
      // Fallback
      GSIStore.setCurrentUser(null);
      router.push("/login");
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[40px] relative">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-white">{t("mon_profil")}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn("p-2 rounded-lg text-white transition-colors", isEditing ? "bg-accent" : "bg-white/20")}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowQr(true)}
              className="bg-white/20 p-2 rounded-lg text-white"
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white/20 flex items-center justify-center">
              <img
                src={user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <>
                <input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && user) {
                      const toastId = toast.loading("Mise à jour de la photo...");
                      setUploadProgress(0);
                      try {
                        setIsUploading(true);
                        // Optimistic Preview
                        const previewUrl = URL.createObjectURL(file);
                        setUser({ ...user, photo: previewUrl });

                        const url = await GSIStore.uploadFile(file, `profiles/${user.id}_${Date.now()}`, (p) => {
                          setUploadProgress(Math.round(p));
                        });

                        const updated = { ...user, photo: url };
                        await GSIStore.updateUser(updated);
                        setUser(updated);
                        toast.success("Photo mise à jour avec succès !", { id: toastId });
                      } catch (err: any) {
                        toast.error("Erreur: " + err.message, { id: toastId });
                        // Revert preview on error
                        const original = GSIStore.getCurrentUser();
                        setUser(original);
                      } finally {
                        setIsUploading(false);
                        setUploadProgress(0);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Camera size={14} />
                </button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                defaultValue={user.fullName}
                onBlur={async (e) => {
                  const updated = {...user, fullName: e.target.value};
                  await GSIStore.updateUser(updated);
                  setUser(updated);
                }}
                className="bg-white/20 border-none rounded-xl px-4 py-1 text-center font-bold text-white outline-none focus:ring-1 ring-white/50"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
              <p className="text-white/70 text-sm font-medium">{user.filiere} • {user.niveau} • {user.campus}</p>
            </>
          )}
        </div>
      </div>

      <div className="px-6 -mt-16 pb-24">
        <div className="bg-white rounded-[32px] p-6 shadow-xl mb-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <Award className="text-primary mb-2" size={24} />
            <span className="text-xs font-bold">{t("reussites")}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <FileCheck className="text-accent mb-2" size={24} />
            <span className="text-xs font-bold">{t("demandes")}</span>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h3 className="text-lg font-bold px-2 mb-4">Paramètres du compte</h3>
          <Link href="/services">
            <ProfileLink icon={CreditCard} label="Paiements & Reçus" color="text-blue-500" />
          </Link>
          <Link href="/services">
            <ProfileLink icon={FileCheck} label="Documents Administratifs" color="text-green-500" />
          </Link>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white mb-4 mt-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg">Career Insight</h4>
                <Award size={24} />
              </div>
              <p className="text-xs opacity-90 mb-4">Nouvelles opportunités de stage disponibles chez les partenaires GSI !</p>
              <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                Voir les opportunités
              </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
            <h4 className="text-sm font-bold mb-3">Langue / Language</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage("fr")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                  language === "fr" ? "bg-primary text-white" : "bg-white text-gray-500"
                )}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                  language === "en" ? "bg-primary text-white" : "bg-white text-gray-500"
                )}
              >
                English
              </button>
            </div>
          </div>
          <ProfileLink icon={Settings} label="Préférences" color="text-gray-500" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-bold bg-red-50 p-4 rounded-2xl mb-8 active:scale-95 transition-transform"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 flex flex-col items-center relative">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-2">Carte Étudiant</h3>
            <p className="text-gray-500 text-sm mb-8">{user.fullName}</p>
            <div className="bg-gray-50 p-6 rounded-[32px] border-4 border-primary/10 mb-8">
              <QrCode size={180} className="text-primary" />
            </div>
            <p className="text-center text-[10px] text-gray-400 font-medium">Scannez ce code à l'entrée du campus ou pour les services de la bibliothèque.</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ProfileLink({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl border border-transparent hover:border-gray-100 active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100", color)}>
          <Icon size={20} />
        </div>
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
