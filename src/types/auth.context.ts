export interface UserType {
    id: string;
    email: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: UserType;
}
export interface AuthContextType {
    isAuthenticated: boolean;
    user: UserType;
    setAuth: (auth: AuthState) => void;
}
