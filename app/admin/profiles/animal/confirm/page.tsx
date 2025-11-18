"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { createAnimalProfile } from "@/actions/profiles/admin";

function ConfirmationContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [submitting, setSubmitting] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);

	// Extract all data from URL params
	const name = searchParams.get("name") || "";
	const species = searchParams.get("species") || "";
	const breed = searchParams.get("breed") || "";
	const description = searchParams.get("description") || "";
	const status = searchParams.get("status") || "In Shelter";
	const photoUrl = searchParams.get("photoUrl") || "";

	// Restore photo File from sessionStorage on mount
	useEffect(() => {
		const savedData = sessionStorage.getItem('animalProfileFormData');
		if (savedData) {
			try {
				const data = JSON.parse(savedData);
				if (data.photoBase64 && data.photoName && data.photoType) {
					fetch(data.photoBase64)
						.then(res => res.blob())
						.then(blob => {
							const file = new File([blob], data.photoName, { type: data.photoType });
							setPhotoFile(file);
						});
				}
			} catch (error) {
				console.error('Failed to restore photo:', error);
			}
		}
	}, []);

	async function handleConfirmSubmit() {
		setSubmitting(true);
		setResultMsg(null);
		try {
			// Upload photo if exists
			let uploadedPhotoUrl = photoUrl;
			if (photoFile) {
				// Import supabase client for upload
				const { supabase } = await import("@/utils/supabase/client");
				const BUCKET = "Animal Profile Photos";
				const ext = photoFile.name.split('.')?.pop() || 'jpg';
				const path = `${crypto.randomUUID()}.${ext}`;
				const { error } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
					cacheControl: '3600',
					upsert: false,
				});
				if (!error) {
					const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
					uploadedPhotoUrl = urlData.publicUrl;
				}
			}

			const res = await createAnimalProfile({
				name,
				species,
				breed,
				description,
				status,
				photoUrl: uploadedPhotoUrl || undefined,
			});

			if (!res.success) {
				setResultMsg(res.error ?? "Failed to create profile");
			} else {
				setResultMsg("Animal profile created successfully!");
				sessionStorage.removeItem('animalProfileFormData');
				setTimeout(() => router.push("/admin/profiles"), 1500);
			}
		} catch (e: any) {
			setResultMsg(e.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-3xl font-extrabold text-gray-900">Confirm Animal Profile</h1>
					<Link href="/admin/profiles" className="text-sm text-purple-700 hover:underline">
						← Back to Profiles
					</Link>
				</div>

				<div className="mb-4">
					<button
						onClick={() => router.back()}
						className="text-sm text-purple-700 hover:underline"
					>
						← Edit Details
					</button>
				</div>

				<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
					{/* Photo and Basic Info Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 p-6 md:p-8">
						{/* Photo Panel */}
						<div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-5">
							<div className="w-full h-[320px] rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
								{photoUrl ? (
									<img src={photoUrl} alt="Animal photo" className="w-full h-full object-cover" />
								) : (
									<div className="flex flex-col items-center text-gray-400 gap-2">
										<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
											<circle cx="12" cy="13" r="4" />
										</svg>
										<span className="text-sm">No Photo</span>
									</div>
								)}
							</div>
							<p className="mt-3 text-xs text-gray-600 text-center">Animal Photo</p>
						</div>

						{/* Fields Panel */}
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<DisplayField label="Animal Name" value={name || "—"} />
								<DisplayField label="Species" value={species || "—"} />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<DisplayField label="Breed" value={breed || "—"} />
								<DisplayField label="Status" value={status} />
							</div>
							<DisplayTextArea label="Description" value={description || "—"} />
						</div>
					</div>

					{/* Action Buttons */}
					<div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col sm:flex-row gap-3">
						<button
							onClick={() => router.back()}
							className="flex-1 px-6 py-3 rounded-md border-2 border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
						>
							Edit Profile
						</button>
						<button
							onClick={handleConfirmSubmit}
							disabled={submitting}
							className="flex-1 px-6 py-3 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{submitting ? 'Creating Profile...' : 'Confirm & Create'}
						</button>
					</div>

					{resultMsg && (
						<div className={`mx-6 md:mx-8 mb-6 md:mb-8 p-4 rounded-md text-sm font-medium text-center ${
							resultMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
						}`}>
							{resultMsg}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

function DisplayField({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
			<p className="text-sm text-gray-900">{value}</p>
		</div>
	);
}

function DisplayTextArea({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
			<p className="text-sm text-gray-900 whitespace-pre-wrap">{value}</p>
		</div>
	);
}

export default function AdminProfileConfirmPage() {
	return (
		<Suspense fallback={
			<main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50 flex items-center justify-center">
				<p className="text-sm text-gray-500">Loading confirmation...</p>
			</main>
		}>
			<ConfirmationContent />
		</Suspense>
	);
}
