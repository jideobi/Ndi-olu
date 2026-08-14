import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleUserRound,
  MapPin,
  Pencil,
  Save,
  Wrench,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  full_name: "",
  phone: "",
  profile_image_url: "",
  bio: "",
  years_experience: 0,
  location: "",
  availability: "Available this week",
  service_ids: [],
  primary_service_id: "",
};

function profileToForm(profile) {
  const services = profile.services || [];
  const primaryService = services.find((service) => service.is_primary);

  return {
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    profile_image_url: profile.profile_image_url || "",
    bio: profile.bio || "",
    years_experience: Number(profile.years_experience || 0),
    location: profile.location || "",
    availability: profile.availability || "Available this week",
    service_ids: services.map((service) => service.id),
    primary_service_id: primaryService?.id || services[0]?.id || "",
  };
}

function WorkerProfileSetup() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedServices = useMemo(
    () => services.filter((service) => form.service_ids.includes(service.id)),
    [form.service_ids, services],
  );

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const [profileResponse, servicesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/worker-profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/services`),
        ]);

        const profileData = await profileResponse.json();
        const servicesData = await servicesResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileData.message || "Unable to load your profile.");
        }

        if (!servicesResponse.ok) {
          throw new Error(servicesData.message || "Unable to load services.");
        }

        setProfile(profileData.profile);
        setForm(profileToForm(profileData.profile));
        setServices(servicesData.services || []);
      } catch (loadError) {
        console.error("Worker profile load error:", loadError);
        setError(loadError.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "years_experience" ? Number(value) : value,
    }));
  }

  function toggleService(serviceId) {
    setForm((current) => {
      const isSelected = current.service_ids.includes(serviceId);
      const serviceIds = isSelected
        ? current.service_ids.filter((id) => id !== serviceId)
        : [...current.service_ids, serviceId];

      return {
        ...current,
        service_ids: serviceIds,
        primary_service_id:
          current.primary_service_id === serviceId && isSelected
            ? serviceIds[0] || ""
            : current.primary_service_id || serviceId,
      };
    });
  }

  function startEditing() {
    setForm(profileToForm(profile));
    setError("");
    setMessage("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm(profileToForm(profile));
    setError("");
    setEditing(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Please provide your name and phone number.");
      return;
    }

    if (form.service_ids.length > 0 && !form.primary_service_id) {
      setError("Choose one selected service as your primary service.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/worker-profile/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your profile.");
      }

      const refreshedResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/worker-profile/me`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const refreshedData = await refreshedResponse.json();

      if (!refreshedResponse.ok) {
        throw new Error(refreshedData.message || "Profile saved, but could not be refreshed.");
      }

      setProfile(refreshedData.profile);
      setForm(profileToForm(refreshedData.profile));
      setEditing(false);
      setMessage("Your worker profile has been saved.");
    } catch (saveError) {
      console.error("Worker profile save error:", saveError);
      setError(saveError.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (user?.role !== "worker") {
    return <Navigate to="/customer-dashboard" replace />;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-ndi-forest" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ndi-orange">Worker profile</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {editing ? "Edit your professional profile" : "Your professional profile"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep this information current so customers can understand your skills and availability.
            </p>
          </div>

          {!editing && (
            <Button onClick={startEditing}>
              <Pencil size={17} className="mr-2" />
              Edit profile
            </Button>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-6 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0" />
            {message}
          </p>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="mt-8 space-y-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <h2 className="text-lg font-extrabold text-slate-950">Personal details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input id="full_name" name="full_name" label="Full name" value={form.full_name} onChange={updateField} required />
                <Input id="phone" name="phone" label="Phone number" type="tel" value={form.phone} onChange={updateField} required />
                <Input id="profile_image_url" name="profile_image_url" label="Profile image URL" type="url" value={form.profile_image_url} onChange={updateField} hint="Use a public image URL. Image uploads can be added later." className="sm:col-span-2" />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <h2 className="text-lg font-extrabold text-slate-950">Professional details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input id="years_experience" name="years_experience" label="Years of experience" type="number" min="0" value={form.years_experience} onChange={updateField} />
                <Input id="location" name="location" label="Location" placeholder="e.g. Enugu" value={form.location} onChange={updateField} />
                <div>
                  <label htmlFor="availability" className="mb-2 block text-sm font-bold text-slate-700">Availability</label>
                  <select id="availability" name="availability" value={form.availability} onChange={updateField} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-ndi-forest focus:ring-2 focus:ring-emerald-100">
                    <option>Available this week</option>
                    <option>Available today</option>
                    <option>Available next week</option>
                    <option>Currently unavailable</option>
                  </select>
                </div>
                <Textarea id="bio" name="bio" label="About your work" value={form.bio} onChange={updateField} placeholder="Describe the services you provide and the experience customers can expect." className="sm:col-span-2" />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <Wrench size={21} className="mt-0.5 text-ndi-forest" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">Services you offer</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Select every service you provide, then choose one as your primary service.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const selected = form.service_ids.includes(service.id);
                  return (
                    <label key={service.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${selected ? "border-ndi-forest bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleService(service.id)} className="h-4 w-4 rounded border-slate-300 text-ndi-forest focus:ring-ndi-forest" />
                      <span className="font-bold text-slate-800">{service.name}</span>
                    </label>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <fieldset className="mt-6 border-t border-slate-100 pt-6">
                  <legend className="text-sm font-bold text-slate-700">Primary service</legend>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {selectedServices.map((service) => (
                      <label key={service.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-ndi-forest">
                        <input type="radio" name="primary_service_id" value={service.id} checked={form.primary_service_id === service.id} onChange={updateField} className="h-4 w-4 border-slate-300 text-ndi-forest focus:ring-ndi-forest" />
                        {service.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={cancelEditing} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                <Save size={17} className="mr-2" />
                {saving ? "Saving profile..." : "Save profile"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {profile?.profile_image_url ? (
                  <img src={profile.profile_image_url} alt="Your profile" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-emerald-50 text-ndi-forest"><CircleUserRound size={38} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-extrabold text-slate-950">{profile?.full_name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{profile?.phone || "No phone number added"}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={16} className="text-ndi-forest" />{Number(profile?.years_experience || 0)} years experience</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-ndi-forest" />{profile?.location || "Location not added"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-7 border-t border-slate-100 pt-6">
                <p className="text-xs font-extrabold tracking-[0.16em] text-ndi-orange">ABOUT</p>
                <p className="mt-3 leading-7 text-slate-600">{profile?.bio || "Add a short introduction so customers know what you do."}</p>
              </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-extrabold tracking-[0.16em] text-ndi-orange">AVAILABILITY</p>
                <p className="mt-3 text-lg font-extrabold text-slate-950">{profile?.availability || "Available this week"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-extrabold tracking-[0.16em] text-ndi-orange">SERVICES</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile?.services?.length ? profile.services.map((service) => (
                    <span key={service.id} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-ndi-forest">
                      {service.name}{service.is_primary ? " · Primary" : ""}
                    </span>
                  )) : <p className="text-sm text-slate-500">No services selected yet.</p>}
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default WorkerProfileSetup;
