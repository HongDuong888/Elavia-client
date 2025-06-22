export interface User {
    email: string;
    password: string;
}
export type Login = Pick<{ email: string; password: string }, 'email' | 'password'>;

export interface RegisterForm {
    first_name: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    sex: string;
    city: string;
    district: string;
    commune: string;
    address: string;
    password: string;
    confirmPassword: string;
}

export type Register = Omit<RegisterForm, 'id'>;
