import { _assert } from "./utils";

export type GuardType = { in: boolean; id: number; v: number };

export class Reader {
  _ref?: React.RefObject<GuardType>;
  _refCurrent?: GuardType;
  _m?: GuardType;

  constructor(ref: React.RefObject<GuardType>, newId?: number) {
    // ref must not be null or undefined
    _assert(ref && ref.current);

    if (newId !== undefined) {
      _assert(ref.current.id < newId);
      ref.current.id = newId;
      ref.current.v = ref.current.v + 1;
    }

    this._ref = ref;
    this._refCurrent = ref.current;
    this._m = { ...ref.current };
  }

  get modified() {
    if (!this._ref!.current || this._refCurrent! !== this._ref!.current) {
      return true;
    }
    return this._m!.v !== this._ref!.current.v;
  }

  private _assertUnmodified() {
    _assert(
      !this.modified,
      "Readonly React.RefObject marker has been modified"
    );
  }

  get in() {
    this._assertUnmodified();
    return this._m!.in;
  }

  delete() {
    this._m = undefined;
    this._ref = undefined;
    this._refCurrent = undefined;
  }
}

export class Writer {
  _ref?: React.RefObject<GuardType>;
  _refCurrent?: GuardType;
  _m?: GuardType;
  constructor(ref: React.RefObject<GuardType>, incId: boolean) {
    _assert(ref && ref.current && !ref.current.in, "marker.in === false");

    this._m = { ...ref.current };
    if (incId) {
      this._m.id++;
    }
    this._m.v++;
    this._m.in = true;

    // Commit
    ref.current = { ...this._m };
    this._ref = ref;
    this._refCurrent = ref.current;
  }

  get modified() {
    if (!this._ref!.current || this._refCurrent! !== this._ref!.current) {
      return true;
    }
    return this._m!.v !== this._ref!.current.v;
  }

  private _assertUnmodified() {
    _assert(!this.modified, "React.RefObject marker has been modified");
  }

  private _commit() {
    _assert(
      this._m!.v === this._ref!.current.v + 1,
      "unexpected marker version"
    );
    this._ref!.current = { ...this._m! };
    this._refCurrent = this._ref!.current;
  }

  get id() {
    this._assertUnmodified();
    return this._m!.id;
  }

  exit() {
    this._assertUnmodified();
    this._m!.in = false;
    this._m!.v++;
    this._commit();

    this._m = undefined;
    this._ref = undefined;
    this._refCurrent = undefined;
  }
}
