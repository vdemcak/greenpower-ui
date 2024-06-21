export type TState = {
    lap: number;
    lap_start: number;
    best_lap: number;
    ar_teo_status: string;
    ar_teo: TArteo;
}

type TArteo = {
    rpm: number;
    speed: number;
    bat1: number;
    bat2: number;
    lap_trigger: number;
}