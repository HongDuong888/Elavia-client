export interface District {
    Id: string;
    Name: string;
    Wards: Ward[];
}

export interface Ward {
    Id: string;
    Name: string;
}

export interface City {
    Id: string;
    Name: string;
    Districts: District[];
}
