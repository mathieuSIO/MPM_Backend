export type MondialRelayPoint = {
    id: string;
    name: string;

    addressLine1: string;
    addressLine2: string | null;

    postalCode: string;
    city: string;
    country: string;

    latitude: number | null;
    longitude: number | null;
};

export type MondialRelayPointRaw = {
    STAT?: string | number;

    Num?: string | number;

    LgAdr1?: string;
    LgAdr2?: string;
    LgAdr3?: string;
    LgAdr4?: string;

    CP?: string | number;
    Ville?: string;
    Pays?: string;

    Latitude?: string;
    Longitude?: string;
};

export type ValidateMondialRelayPointInput = {
    relayPointId: string;
    country: string;
};

export type MondialRelaySearchParameters = {
    Enseigne: string;
    Pays: string;
    NumPointRelais: string;
    Ville: string;
    CP: string;
    Latitude: string;
    Longitude: string;
    Taille: string;
    Poids: string;
    Action: string;
    DelaiEnvoi: string;
    RayonRecherche: string;
    TypeActivite: string;
    NACE: string;
    NombreResultats: string;
};