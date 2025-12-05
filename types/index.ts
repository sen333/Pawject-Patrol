export type Volunteer = {
	volunteer_id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	emergency_contact?: string | null;
	skills?: string | null;
	availability?: string | null;
	notes?: string | null;
	volunteer_photo?: string | null;
	approved?: boolean;
	created_at?: string | null;
};

export type CreateVolunteerInput = {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	emergencyContact?: string;
	skills?: string;
	availability?: string;
	notes?: string;
	photoUrl?: string;
	approved?: boolean;
};

export type UpdateVolunteerInput = {
	id: string;
} & Partial<CreateVolunteerInput>;
