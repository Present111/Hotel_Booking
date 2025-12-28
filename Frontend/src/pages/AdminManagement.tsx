import {
  Activity,
  Calendar,
  Edit,
  Plus,
  Trash,
  Users as UsersIcon,
  Home,
  DollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import type {
  AdminBookingPayload,
  AdminUserPayload,
  AdminUserUpdatePayload,
} from "../api-client";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import useAppContext from "../hooks/useAppContext";
import type { BookingType, HotelType, UserType } from "../../shared/types";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

const statusOptions: BookingType["status"][] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "refunded",
];
const paymentOptions: BookingType["paymentStatus"][] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];
const roleOptions: UserType["role"][] = ["user", "hotel_owner", "admin"];

type BookingWithRefs = BookingType & {
  hotel?: Partial<HotelType>;
  user?: Partial<UserType>;
};

const AdminManagement = () => {
  const { showToast } = useAppContext();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"hotels" | "users" | "bookings">("hotels");
  const [newUser, setNewUser] = useState<AdminUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [drafts, setDrafts] = useState<Record<string, AdminUserUpdatePayload>>(
    {}
  );
  const [newBooking, setNewBooking] = useState<AdminBookingPayload>({
    userId: "",
    hotelId: "",
    firstName: "",
    lastName: "",
    email: "",
    adultCount: 1,
    childCount: 0,
    checkIn: "",
    checkOut: "",
    totalCost: 0,
    status: "confirmed",
    paymentStatus: "paid",
  });
  const [hotelSearch, setHotelSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    BookingType["status"] | "all"
  >("all");
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState<
    BookingType["paymentStatus"] | "all"
  >("all");

  const hotelsQuery = useQueryWithLoading<HotelType[]>(
    "admin-hotels",
    apiClient.fetchMyHotels
  );
  const usersQuery = useQueryWithLoading<UserType[]>(
    "admin-users",
    apiClient.fetchAdminUsers
  );
  const bookingsQuery = useQueryWithLoading<BookingWithRefs[]>(
    "admin-bookings",
    apiClient.fetchAllBookings
  );

  const filteredHotels = useMemo(() => {
    if (!hotelsQuery.data) return [];
    if (!hotelSearch.trim()) return hotelsQuery.data;
    const keyword = hotelSearch.toLowerCase();
    return hotelsQuery.data.filter(
      (h) =>
        h.name.toLowerCase().includes(keyword) ||
        h.city.toLowerCase().includes(keyword) ||
        h.country.toLowerCase().includes(keyword) ||
        h.userId?.toLowerCase().includes(keyword)
    );
  }, [hotelSearch, hotelsQuery.data]);

  const filteredUsers = useMemo(() => {
    if (!usersQuery.data) return [];
    if (!userSearch.trim()) return usersQuery.data;
    const keyword = userSearch.toLowerCase();
    return usersQuery.data.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        (u.role || "").toLowerCase().includes(keyword)
    );
  }, [userSearch, usersQuery.data]);

  const filteredBookings = useMemo(() => {
    if (!bookingsQuery.data) return [];
    const keyword = bookingSearch.toLowerCase();
    return bookingsQuery.data.filter((b) => {
      const matchesText =
        !keyword ||
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(keyword) ||
        (b.email || "").toLowerCase().includes(keyword) ||
        (b.hotel?.name || "").toLowerCase().includes(keyword) ||
        (b.hotel?.city || "").toLowerCase().includes(keyword);
      const matchesStatus =
        bookingStatusFilter === "all" || b.status === bookingStatusFilter;
      const matchesPayment =
        bookingPaymentFilter === "all" ||
        b.paymentStatus === bookingPaymentFilter;
      return matchesText && matchesStatus && matchesPayment;
    });
  }, [
    bookingSearch,
    bookingStatusFilter,
    bookingPaymentFilter,
    bookingsQuery.data,
  ]);

  const toastError = (message: string) =>
    showToast({ title: "Action failed", description: message, type: "ERROR" });
  const toastOk = (title: string, description?: string) =>
    showToast({ title, description, type: "SUCCESS" });

  const deleteHotel = useMutation(apiClient.deleteHotel, {
    onSuccess: () => {
      qc.invalidateQueries("admin-hotels");
      qc.invalidateQueries("admin-bookings");
      toastOk("Hotel deleted");
    },
    onError: () => toastError("Could not delete hotel"),
  });

  const createUser = useMutation(apiClient.createAdminUser, {
    onSuccess: () => {
      qc.invalidateQueries("admin-users");
      setNewUser({ firstName: "", lastName: "", email: "", password: "", role: "user" });
      toastOk("User created");
    },
    onError: () => toastError("Could not create user"),
  });

  const updateUser = useMutation(
    ({ userId, updates }: { userId: string; updates: AdminUserUpdatePayload }) =>
      apiClient.updateAdminUser(userId, updates),
    {
      onSuccess: () => {
        qc.invalidateQueries("admin-users");
        toastOk("User updated");
      },
      onError: () => toastError("Could not update user"),
    }
  );

  const deleteUser = useMutation(apiClient.deleteAdminUser, {
    onSuccess: () => {
      qc.invalidateQueries("admin-users");
      qc.invalidateQueries("admin-hotels");
      qc.invalidateQueries("admin-bookings");
      toastOk("User deleted");
    },
    onError: () => toastError("Could not delete user"),
  });

  const createBooking = useMutation(apiClient.createAdminBooking, {
    onSuccess: () => {
      qc.invalidateQueries("admin-bookings");
      qc.invalidateQueries("admin-hotels");
      setNewBooking((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
      toastOk("Booking created");
    },
    onError: () => toastError("Could not create booking"),
  });

  const updateBookingStatus = useMutation(
    ({ id, status }: { id: string; status: BookingType["status"] }) =>
      apiClient.updateBookingStatus(id, { status }),
    {
      onSuccess: () => {
        qc.invalidateQueries("admin-bookings");
        toastOk("Booking status updated");
      },
      onError: () => toastError("Could not update booking status"),
    }
  );

  const updatePayment = useMutation(
    ({ id, paymentStatus }: { id: string; paymentStatus: BookingType["paymentStatus"] }) =>
      apiClient.updateBookingPayment(id, { paymentStatus }),
    {
      onSuccess: () => {
        qc.invalidateQueries("admin-bookings");
        toastOk("Payment status updated");
      },
      onError: () => toastError("Could not update payment status"),
    }
  );

  const deleteBooking = useMutation(apiClient.deleteBooking, {
    onSuccess: () => {
      qc.invalidateQueries("admin-bookings");
      toastOk("Booking deleted");
    },
    onError: () => toastError("Could not delete booking"),
  });

  const formatMoney = (n?: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

  const onCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      return toastError("Name, email, and password are required");
    }
    createUser.mutate(newUser);
  };

  const onSaveUser = (id: string) => {
    const updates = drafts[id];
    if (!updates || Object.keys(updates).length === 0) return;
    updateUser.mutate({ userId: id, updates });
  };

  const onCreateBooking = () => {
    if (!newBooking.userId || !newBooking.hotelId || !newBooking.checkIn || !newBooking.checkOut) {
      return toastError("User, hotel, and dates are required");
    }
    createBooking.mutate({
      ...newBooking,
      adultCount: Number(newBooking.adultCount),
      childCount: Number(newBooking.childCount),
      totalCost: Number(newBooking.totalCost),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Admin</p>
          <h1 className="text-2xl font-bold">Control center</h1>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "hotels" ? "default" : "outline"} onClick={() => setTab("hotels")}>Hotels</Button>
          <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}>Users</Button>
          <Button variant={tab === "bookings" ? "default" : "outline"} onClick={() => setTab("bookings")}>Bookings</Button>
        </div>
      </div>

      {tab === "hotels" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-700">
              <Home className="w-5 h-5" />
              <span>{filteredHotels.length} hotels</span>
              <DollarSign className="w-5 h-5" />
              <span>{formatMoney(hotelsQuery.data?.reduce((s, h) => s + (h.totalRevenue || 0), 0))}</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, city, owner..."
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="w-64"
              />
              <Button asChild>
                <Link to="/add-hotel">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Link>
              </Button>
              <Button variant="outline" onClick={() => hotelsQuery.refetch?.()}>
                Refresh
              </Button>
            </div>
          </div>
          {hotelsQuery.isLoading ? (
            <p>Loading hotels...</p>
          ) : (
            <ul className="space-y-3">
              {filteredHotels.map((h) => (
                <li key={h._id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-sm text-gray-600">{h.city}, {h.country}</div>
                    <div className="text-xs text-gray-500">Owner: {h.userId}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/edit-hotel/${h._id}`} className="px-3 py-1 bg-gray-100 rounded text-sm flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => deleteHotel.mutate(h._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm flex items-center gap-1"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200 text-blue-900 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <UsersIcon className="w-4 h-4" />
                New user
              </div>
              <h3 className="text-2xl font-semibold mt-2 text-blue-900">Invite & elevate</h3>
              <p className="text-blue-800 text-sm mt-1">
                Tạo nhanh tài khoản mới, phân quyền và kiểm soát trạng thái kích hoạt.
              </p>

              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-blue-900">First</Label>
                    <Input
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      className="bg-white/90 border-white/60 text-blue-900 placeholder:text-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-900">Last</Label>
                    <Input
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      className="bg-white/90 border-white/60 text-blue-900 placeholder:text-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-blue-900">Email</Label>
                  <Input
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-white/90 border-white/60 text-blue-900 placeholder:text-blue-500"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-blue-900">Password</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="bg-white/90 border-white/60 text-blue-900 placeholder:text-blue-500"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-900">Role</Label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserType["role"] })}
                      className="w-full rounded-md bg-white/90 border border-white/60 text-blue-900 px-3 py-2"
                    >
                      {roleOptions.map((r) => (
                        <option key={r} className="text-gray-900">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={onCreateUser}
                  className="w-full bg-blue-700 text-white hover:bg-blue-800 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create user
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <UsersIcon className="w-4 h-4" />
                    All users
                  </div>
                  <p className="text-sm text-gray-500">
                    Tổng: {filteredUsers.length} tài khoản
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    placeholder="Search name, email, role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-64"
                  />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      Active {filteredUsers.filter((u) => u.isActive)?.length || 0}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      Inactive {filteredUsers.filter((u) => !u.isActive)?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {usersQuery.isLoading ? (
                  <p className="text-gray-600">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-xl text-center text-gray-500">
                    Chưa có user nào.
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="rounded-xl border border-gray-100 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)] bg-gradient-to-r from-white via-white to-slate-50 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {u.role}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <Label className="text-xs text-gray-600">Role</Label>
                          <select
                            value={drafts[u._id]?.role || u.role}
                            onChange={(e) =>
                              setDrafts({
                                ...drafts,
                                [u._id]: { ...drafts[u._id], role: e.target.value as UserType["role"] },
                              })
                            }
                            className="w-full border rounded px-3 py-2 bg-white/80"
                          >
                            {roleOptions.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Active</Label>
                          <select
                            value={(drafts[u._id]?.isActive ?? u.isActive) ? "true" : "false"}
                            onChange={(e) =>
                              setDrafts({
                                ...drafts,
                                [u._id]: { ...drafts[u._id], isActive: e.target.value === "true" },
                              })
                            }
                            className="w-full border rounded px-3 py-2 bg-white/80"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">New password</Label>
                        <Input
                          type="password"
                          onChange={(e) =>
                            setDrafts({
                              ...drafts,
                              [u._id]: { ...drafts[u._id], password: e.target.value },
                            })
                          }
                          className="bg-white"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(u.updatedAt || u.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => onSaveUser(u._id)}>
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => deleteUser.mutate(u._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-4">
          <div className="border rounded p-4 space-y-3">
            <div className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />Manual booking</div>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <Label>User</Label>
                <select
                  value={newBooking.userId}
                  onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value })}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Select user</option>
                  {(usersQuery.data || []).map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Hotel</Label>
                <select
                  value={newBooking.hotelId}
                  onChange={(e) => setNewBooking({ ...newBooking, hotelId: e.target.value })}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Select hotel</option>
                  {(hotelsQuery.data || []).map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Email</Label>
                <Input value={newBooking.email} onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })} />
              </div>
              <div>
                <Label>First</Label>
                <Input value={newBooking.firstName} onChange={(e) => setNewBooking({ ...newBooking, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last</Label>
                <Input value={newBooking.lastName} onChange={(e) => setNewBooking({ ...newBooking, lastName: e.target.value })} />
              </div>
              <div>
                <Label>Adults</Label>
                <Input
                  type="number"
                  min={1}
                  value={newBooking.adultCount}
                  onChange={(e) => setNewBooking({ ...newBooking, adultCount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Children</Label>
                <Input
                  type="number"
                  min={0}
                  value={newBooking.childCount}
                  onChange={(e) => setNewBooking({ ...newBooking, childCount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Check-in</Label>
                <Input type="date" value={newBooking.checkIn} onChange={(e) => setNewBooking({ ...newBooking, checkIn: e.target.value })} />
              </div>
              <div>
                <Label>Check-out</Label>
                <Input type="date" value={newBooking.checkOut} onChange={(e) => setNewBooking({ ...newBooking, checkOut: e.target.value })} />
              </div>
              <div>
                <Label>Total</Label>
                <Input
                  type="number"
                  min={0}
                  value={newBooking.totalCost}
                  onChange={(e) => setNewBooking({ ...newBooking, totalCost: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={newBooking.status}
                  onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value as BookingType["status"] })}
                  className="w-full border rounded px-2 py-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Payment</Label>
                <select
                  value={newBooking.paymentStatus}
                  onChange={(e) => setNewBooking({ ...newBooking, paymentStatus: e.target.value as BookingType["paymentStatus"] })}
                  className="w-full border rounded px-2 py-2"
                >
                  {paymentOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={onCreateBooking} className="w-full">
              <Plus className="w-4 h-4 mr-1" />Create booking
            </Button>
          </div>

          <div className="border rounded p-4">
            <div className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4" />All bookings</div>
            {bookingsQuery.isLoading ? (
              <p>Loading bookings...</p>
            ) : filteredBookings.length === 0 ? (
              <div className="p-4 text-gray-500 border border-dashed rounded-lg text-center">
                No bookings found.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 mb-3">
                  <Input
                    placeholder="Search by guest, email, hotel, city..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) =>
                      setBookingStatusFilter(e.target.value as BookingType["status"] | "all")
                    }
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All status</option>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={bookingPaymentFilter}
                    onChange={(e) =>
                      setBookingPaymentFilter(
                        e.target.value as BookingType["paymentStatus"] | "all"
                      )
                    }
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All payment</option>
                    {paymentOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="p-2">Guest</th>
                        <th className="p-2">Hotel</th>
                        <th className="p-2">Dates</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Payment</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr key={b._id} className="border-t">
                          <td className="p-2">
                            <div className="font-semibold">{b.firstName} {b.lastName}</div>
                            <div className="text-xs text-gray-500">{b.email}</div>
                          </td>
                          <td className="p-2">{b.hotel?.name || "-"}</td>
                          <td className="p-2">{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</td>
                          <td className="p-2">{formatMoney(b.totalCost)}</td>
                          <td className="p-2">
                            <select
                              value={b.status || "pending"}
                              onChange={(e) =>
                                updateBookingStatus.mutate({
                                  id: b._id,
                                  status: e.target.value as BookingType["status"],
                                })
                              }
                              className="border rounded px-2 py-1"
                            >
                              {statusOptions.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <select
                              value={b.paymentStatus || "pending"}
                              onChange={(e) =>
                                updatePayment.mutate({
                                  id: b._id,
                                  paymentStatus: e.target.value as BookingType["paymentStatus"],
                                })
                              }
                              className="border rounded px-2 py-1"
                            >
                              {paymentOptions.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => deleteBooking.mutate(b._id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
