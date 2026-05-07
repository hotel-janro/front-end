import React, { useEffect, useMemo, useState } from "react";
import {
	Building2,
	ShoppingCart,
	CreditCard,
	Receipt,
	Clock3,
	CalendarDays,
	ArrowUpRight,
	DollarSign,
	TrendingUp,
	Wallet,
	CheckCircle2,
	AlertCircle,
	XCircle,
	Wifi,
	Landmark,
} from "lucide-react";
import { posOrders } from "../../../data/newMockData.js";
import { useSettings } from "../../../context/SettingsContext.jsx";
import "./CashierDashbord.css";

function formatTime(value) {
	return new Date(value).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDate(value) {
	return new Date(value).toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function getGreeting(hour) {
	if (hour < 12) return "Morning";
	if (hour < 17) return "Afternoon";
	return "Evening";
}

function getStatusPill(status) {
	if (status === "Completed") return "bg-green-100 text-green-700";
	if (status === "Pending") return "bg-amber-100 text-amber-700";
	return "bg-red-100 text-red-700";
}

function getPaymentIcon(method) {
	if (method === "Card") return CreditCard;
	if (method === "Cash") return Landmark;
	if (method === "Online") return Wifi;
	return DollarSign;
}

function getPaymentLabel(method) {
	if (method === "Cash") return "Room Charge";
	return method;
}

export function CashierDashboard() {
	const { settings } = useSettings();
	const [now, setNow] = useState(new Date());

	function formatMoney(value) {
		return `${settings.currency.symbol}${value.toLocaleString(undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	}

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const completedOrders = posOrders.filter((order) => order.status === "Completed");
	const pendingOrders = posOrders.filter((order) => order.status === "Pending");
	const cancelledOrders = posOrders.filter((order) => order.status === "Cancelled");

	const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
	const totalTax = completedOrders.reduce((sum, order) => sum + order.tax, 0);
	const avgOrderValue = completedOrders.length
		? totalRevenue / completedOrders.length
		: 0;

	const recentOrders = [...posOrders]
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 4);

	const paymentBreakdown = useMemo(() => {
		const totals = completedOrders.reduce((acc, order) => {
			acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.totalAmount;
			return acc;
		}, {});

		return Object.entries(totals).map(([method, amount]) => {
			const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
			return { method, amount, percentage };
		});
	}, [completedOrders, totalRevenue]);

	const stats = [
		{
			label: "Today's Revenue",
			value: formatMoney(totalRevenue),
			note: "+12.5%",
			Icon: DollarSign,
			card: "bg-emerald-50 border-emerald-200",
			icon: "bg-emerald-100 text-emerald-600",
			text: "text-emerald-700",
		},
		{
			label: "Total Orders",
			value: String(posOrders.length),
			note: `${pendingOrders.length} pending`,
			Icon: ShoppingCart,
			card: "bg-blue-50 border-blue-200",
			icon: "bg-blue-100 text-blue-600",
			text: "text-blue-700",
		},
		{
			label: "Avg Order Value",
			value: formatMoney(avgOrderValue),
			note: "+8.3%",
			Icon: TrendingUp,
			card: "bg-violet-50 border-violet-200",
			icon: "bg-violet-100 text-violet-600",
			text: "text-violet-700",
		},
		{
			label: "Tax Collected",
			value: formatMoney(totalTax),
			note: `${completedOrders.length} orders`,
			Icon: Receipt,
			card: "bg-amber-50 border-amber-200",
			icon: "bg-amber-100 text-amber-600",
			text: "text-amber-700",
		},
	];

	return (
		<div className="space-y-6">
			<main className="space-y-6">
				<section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white p-6 md:p-8">
					<div className="absolute right-8 top-2 h-36 w-36 rounded-full bg-white/10" />
					<div className="absolute right-24 top-0 h-20 w-20 rounded-full bg-white/10" />

					<div className="relative z-10">
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
							Good {getGreeting(now.getHours())}! Welcome to POS
						</h2>
						<p className="mt-2 text-base text-emerald-100">
							Here&apos;s your sales overview for {formatDate(now)}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<button
								type="button"
								className="cashier-hero-btn"
							>
								<ShoppingCart className="h-5 w-5" />
								View Orders
							</button>
							<button
								type="button"
								className="cashier-hero-btn"
							>
								<Wallet className="h-5 w-5" />
								Payments
							</button>
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
					{stats.map((stat) => {
						const Icon = stat.Icon;
						return (
							<article key={stat.label} className={`rounded-2xl border p-4 ${stat.card}`}>
								<div className="flex items-center gap-3">
									<div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.icon}`}>
										<Icon className="h-6 w-6" />
									</div>
									<div>
										<p className={`text-base font-medium ${stat.text}`}>{stat.label}</p>
										<h3 className={`text-2xl font-semibold leading-tight ${stat.text}`}>{stat.value}</h3>
										<p className={`text-sm mt-1 inline-flex items-center gap-1 ${stat.text}`}>
											<ArrowUpRight className="h-4 w-4" />
											{stat.note}
										</p>
									</div>
								</div>
							</article>
						);
					})}
				</section>

				<section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					<article className="cashier-panel xl:col-span-2">
						<header className="cashier-panel-header flex items-center justify-between">
							<h3 className="cashier-panel-title">
								<span className="cashier-panel-icon bg-blue-100 text-blue-600">
									<ShoppingCart className="h-5 w-5" />
								</span>
								Recent Orders
							</h3>
							<button type="button" className="text-sm font-medium text-teal-600 hover:text-teal-700">
								View All
							</button>
						</header>

						<div className="divide-y divide-gray-100">
							{recentOrders.map((order, index) => (
								<div key={order.id} className="px-6 py-4 flex items-center justify-between gap-3">
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<p className="text-lg font-semibold text-gray-900">
												POS-{String(index + 1).padStart(3, "0")}
											</p>
											<span
												className={`px-2.5 py-1 rounded-full text-sm font-semibold ${getStatusPill(
													order.status
												)}`}
											>
												{order.status}
											</span>
										</div>
										<p className="text-sm text-gray-500 mt-1">
											{order.customerName} <span className="mx-2 text-gray-300">|</span>
											{order.type} <span className="mx-2 text-gray-300">|</span>
											{formatTime(order.createdAt)}
										</p>
									</div>

									<div className="text-right">
										<p className="text-lg font-semibold text-gray-900">{formatMoney(order.totalAmount)}</p>
										<p className="text-sm text-gray-500">{getPaymentLabel(order.paymentMethod)}</p>
									</div>
								</div>
							))}
						</div>
					</article>

					<div className="space-y-6">
						<article className="cashier-panel">
							<header className="cashier-panel-header">
								<h3 className="cashier-panel-title">
									<span className="cashier-panel-icon bg-emerald-100 text-emerald-600">
										<Wallet className="h-5 w-5" />
									</span>
									Payment Methods
								</h3>
							</header>

							<div className="px-6 py-4 space-y-4">
								{paymentBreakdown.map((item) => {
									const MethodIcon = getPaymentIcon(item.method);
									return (
										<div key={item.method}>
											<div className="flex items-center justify-between text-sm mb-2">
												<span className="inline-flex items-center gap-2 text-gray-700">
													<MethodIcon className="h-4 w-4" />
													{getPaymentLabel(item.method)}
												</span>
												<span className="font-semibold text-gray-900">{formatMoney(item.amount)}</span>
											</div>
											<div className="h-3 rounded-full bg-gray-100 overflow-hidden">
												<div
													className="h-full bg-teal-500 rounded-full transition-all duration-300"
													style={{ width: `${item.percentage}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</article>

						<article className="cashier-panel">
							<header className="cashier-panel-header">
								<h3 className="cashier-panel-title">
									<span className="cashier-panel-icon bg-violet-100 text-violet-600">
										<Clock3 className="h-5 w-5" />
									</span>
									Order Status
								</h3>
							</header>

							<div className="p-6 space-y-3">
								<div className="flex items-center justify-between p-4 rounded-xl bg-green-50">
									<span className="inline-flex items-center gap-2 text-green-700 font-semibold text-sm">
										<CheckCircle2 className="h-5 w-5" />
										Completed
									</span>
									<span className="text-2xl font-semibold text-green-700">{completedOrders.length}</span>
								</div>
								<div className="flex items-center justify-between p-4 rounded-xl bg-amber-50">
									<span className="inline-flex items-center gap-2 text-amber-700 font-semibold text-sm">
										<AlertCircle className="h-5 w-5" />
										Pending
									</span>
									<span className="text-2xl font-semibold text-amber-700">{pendingOrders.length}</span>
								</div>
								<div className="flex items-center justify-between p-4 rounded-xl bg-red-50">
									<span className="inline-flex items-center gap-2 text-red-700 font-semibold text-sm">
										<XCircle className="h-5 w-5" />
										Cancelled
									</span>
									<span className="text-2xl font-semibold text-red-700">{cancelledOrders.length}</span>
								</div>
							</div>
						</article>
					</div>
				</section>
			</main>
		</div>
	);
}
