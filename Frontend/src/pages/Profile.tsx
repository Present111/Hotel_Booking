import { useQuery, useMutation, useQueryClient } from "react-query";
import { Mail, Shield, UserRound, Phone, MapPin, CalendarClock } from "lucide-react";
import * as apiClient from "../api-client";
import type { UserType } from "../../shared/types";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import useAppContext from "../hooks/useAppContext";

const Profile = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const { data, isLoading, error } = useQuery<UserType>(
    "profile",
    apiClient.fetchCurrentUser,
    {
      staleTime: 5 * 60 * 1000,
    }
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        zipCode: data.address?.zipCode || "",
      });
    }
  }, [data]);

  const updateProfile = useMutation(apiClient.updateCurrentUser, {
    onSuccess: async () => {
      showToast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
        type: "SUCCESS",
      });
      setIsEditing(false);
      await queryClient.invalidateQueries("profile");
    },
    onError: (err: any) => {
      showToast({
        title: "Update failed",
        description: err?.message || "Unable to update profile.",
        type: "ERROR",
      });
    },
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-600">Unable to load profile</div>
      </div>
    );
  }

  const fullName = `${data.firstName} ${data.lastName}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <UserRound className="w-10 h-10 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">Thông tin tài khoản và trạng thái hiện tại.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{fullName}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                {data.email}
              </div>
              {data.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  {data.phone}
                </div>
              )}
            </div>
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {data.role}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Account ID</div>
              <div className="font-semibold text-gray-900 break-all">{data._id}</div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  {data.isActive ? "Active" : "Inactive"}
                </span>
                {data.emailVerified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    Email not verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <div className="flex items-start gap-2 text-gray-800">
                <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                <div className="space-y-0.5 text-sm">
                  <div>{data.address?.street || "N/A"}</div>
                  <div>
                    {[data.address?.city, data.address?.state, data.address?.country]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </div>
                  <div>{data.address?.zipCode || ""}</div>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Activity</div>
              <div className="flex flex-col gap-1 text-sm text-gray-800">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-gray-500" />
                  Created: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-gray-500" />
                  Updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  Role: {data.role}
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-500 mb-1">Preferences</div>
            <div className="text-sm text-gray-800">
              {data.preferences?.preferredDestinations?.length ? (
                <div className="space-y-1">
                  <div className="font-semibold">Preferred Destinations:</div>
                  <div className="flex flex-wrap gap-2">
                    {data.preferences.preferredDestinations.map((dest) => (
                      <Badge key={dest} variant="outline" className="bg-white border-gray-200">
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div>Chưa thiết lập.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-600">
                Update your personal information and contact details.
              </p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="default">
                Edit
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">First name</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Last name</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Street</label>
                <Input
                  value={form.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">State</label>
                <Input
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">ZIP / Postal code</label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button type="submit" disabled={updateProfile.isLoading}>
                  {updateProfile.isLoading ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    if (data) {
                      setForm({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        street: data.address?.street || "",
                        city: data.address?.city || "",
                        state: data.address?.state || "",
                        country: data.address?.country || "",
                        zipCode: data.address?.zipCode || "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
