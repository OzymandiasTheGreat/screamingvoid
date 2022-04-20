declare module "sodium-universal" {
	/// <reference types="node" />

	export declare const SODIUM_SIZE_MAX: bigint;
	export declare const crypto_aead_aes256gcm_KEYBYTES = 32;
	export declare const crypto_aead_aes256gcm_NSECBYTES = 0;
	export declare const crypto_aead_aes256gcm_NPUBBYTES = 12;
	export declare const crypto_aead_aes256gcm_ABYTES = 16;
	export declare const crypto_aead_aes256gcm_MESSAGEBYTES_MAX: number;
	export declare const crypto_aead_chacha20poly1305_ietf_KEYBYTES = 32;
	export declare const crypto_aead_chacha20poly1305_ietf_NSECBYTES = 0;
	export declare const crypto_aead_chacha20poly1305_ietf_NPUBBYTES = 12;
	export declare const crypto_aead_chacha20poly1305_ietf_ABYTES = 16;
	export declare const crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX: number;
	export declare const crypto_aead_chacha20poly1305_KEYBYTES = 32;
	export declare const crypto_aead_chacha20poly1305_NSECBYTES = 0;
	export declare const crypto_aead_chacha20poly1305_NPUBBYTES = 8;
	export declare const crypto_aead_chacha20poly1305_ABYTES = 16;
	export declare const crypto_aead_chacha20poly1305_MESSAGEBYTES_MAX: bigint;
	export declare const crypto_aead_chacha20poly1305_IETF_KEYBYTES = 32;
	export declare const crypto_aead_chacha20poly1305_IETF_NSECBYTES = 0;
	export declare const crypto_aead_chacha20poly1305_IETF_NPUBBYTES = 24;
	export declare const crypto_aead_chacha20poly1305_IETF_ABYTES = 26;
	export declare const crypto_aead_chacha20poly1305_IETF_MESSAGEBYTES_MAX: bigint;
	export declare const crypto_aead_xchacha20poly1305_ietf_KEYBYTES = 32;
	export declare const crypto_aead_xchacha20poly1305_ietf_NSECBYTES = 0;
	export declare const crypto_aead_xchacha20poly1305_ietf_NPUBBYTES = 24;
	export declare const crypto_aead_xchacha20poly1305_ietf_ABYTES = 16;
	export declare const crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX = 4294967279;
	export declare const crypto_aead_xchacha20poly1305_IETF_KEYBYTES = 32;
	export declare const crypto_aead_xchacha20poly1305_IETF_NSECBYTES = 0;
	export declare const crypto_aead_xchacha20poly1305_IETF_NPUBBYTES = 24;
	export declare const crypto_aead_xchacha20poly1305_IETF_ABYTES = 16;
	export declare const crypto_aead_xchacha20poly1305_IETF_MESSAGEBYTES_MAX: bigint;
	export declare const crypto_auth_BYTES = 32;
	export declare const crypto_auth_KEYBYTES = 32;
	export declare const crypto_auth_PRIMITIVE = "hmacsha512256";
	export declare const crypto_auth_hmacsha256_BYTES = 32;
	export declare const crypto_auth_hmacsha256_KEYBYTES = 32;
	export declare const crypto_auth_hmacsha512_BYTES = 64;
	export declare const crypto_auth_hmacsha512_KEYBYTES = 32;
	export declare const crypto_auth_hmacsha512256_BYTES = 32;
	export declare const crypto_auth_hmacsha512256_KEYBYTES = 32;
	export declare const crypto_box_SEEDBYTES = 32;
	export declare const crypto_box_PUBLICKEYBYTES = 32;
	export declare const crypto_box_SECRETKEYBYTES = 32;
	export declare const crypto_box_NONCEBYTES = 24;
	export declare const crypto_box_MACBYTES = 16;
	export declare const crypto_box_MESSAGEBYTES_MAX: number;
	export declare const crypto_box_PRIMITIVE = "curve25519xsalsa20poly1305";
	export declare const crypto_box_BEFORENMBYTES = 32;
	export declare const crypto_box_SEALBYTES = 48;
	export declare const crypto_box_ZEROBYTES = 32;
	export declare const crypto_box_BOXZEROBYTES = 16;
	export declare const crypto_box_curve25519xchacha20poly1305_SEEDBYTES = 32;
	export declare const crypto_box_curve25519xchacha20poly1305_PUBLICKEYBYTES = 32;
	export declare const crypto_box_curve25519xchacha20poly1305_SECRETKEYBYTES = 32;
	export declare const crypto_box_curve25519xchacha20poly1305_BEFORENMBYTES = 32;
	export declare const crypto_box_curve25519xchacha20poly1305_NONCEBYTES = 24;
	export declare const crypto_box_curve25519xchacha20poly1305_MACBYTES = 16;
	export declare const crypto_box_curve25519xchacha20poly1305_MESSAGEBYTES_MAX: number;
	export declare const crypto_box_curve25519xchacha20poly1305_SEALBYTES = 48;
	export declare const crypto_box_curve25519xsalsa20poly1305_SEEDBYTES = 32;
	export declare const crypto_box_curve25519xsalsa20poly1305_PUBLICKEYBYTES = 32;
	export declare const crypto_box_curve25519xsalsa20poly1305_SECRETKEYBYTES = 32;
	export declare const crypto_box_curve25519xsalsa20poly1305_BEFORENMBYTES = 32;
	export declare const crypto_box_curve25519xsalsa20poly1305_NONCEBYTES = 24;
	export declare const crypto_box_curve25519xsalsa20poly1305_MACBYTES = 16;
	export declare const crypto_box_curve25519xsalsa20poly1305_MESSAGEBYTES_MAX: number;
	export declare const crypto_box_curve25519xsalsa20poly1305_BOXZEROBYTES = 16;
	export declare const crypto_box_curve25519xsalsa20poly1305_ZEROBYTES = 32;
	export declare const crypto_core_ed25519_BYTES = 32;
	export declare const crypto_core_ed25519_UNIFORMBYTES = 32;
	export declare const crypto_core_ed25519_HASHBYTES = 64;
	export declare const crypto_core_ed25519_SCALARBYTES = 32;
	export declare const crypto_core_ed25519_NONREDUCEDSCALARBYTES = 64;
	export declare const crypto_core_hchacha20_OUTPUTBYTES = 32;
	export declare const crypto_core_hchacha20_INPUTBYTES = 16;
	export declare const crypto_core_hchacha20_KEYBYTES = 32;
	export declare const crypto_core_hchacha20_CONSTBYTES = 16;
	export declare const crypto_core_hsalsa20_OUTPUTBYTES = 32;
	export declare const crypto_core_hsalsa20_INPUTBYTES = 16;
	export declare const crypto_core_hsalsa20_KEYBYTES = 32;
	export declare const crypto_core_hsalsa20_CONSTBYTES = 16;
	export declare const crypto_core_ristretto255_BYTES = 32;
	export declare const crypto_core_ristretto255_HASHBYTES = 64;
	export declare const crypto_core_ristretto255_SCALARBYTES = 32;
	export declare const crypto_core_ristretto255_NONREDUCEDSCALARBYTES = 64;
	export declare const crypto_core_salsa20_OUTPUTBYTES = 64;
	export declare const crypto_core_salsa20_INPUTBYTES = 16;
	export declare const crypto_core_salsa20_KEYBYTES = 32;
	export declare const crypto_core_salsa20_CONSTBYTES = 16;
	export declare const crypto_core_salsa2012_OUTPUTBYTES = 64;
	export declare const crypto_core_salsa2012_INPUTBYTES = 16;
	export declare const crypto_core_salsa2012_KEYBYTES = 32;
	export declare const crypto_core_salsa2012_CONSTBYTES = 16;
	export declare const crypto_core_salsa208_OUTPUTBYTES = 64;
	export declare const crypto_core_salsa208_INPUTBYTES = 16;
	export declare const crypto_core_salsa208_KEYBYTES = 32;
	export declare const crypto_core_salsa208_CONSTBYTES = 16;
	export declare const crypto_generichash_BYTES_MIN = 16;
	export declare const crypto_generichash_BYTES_MAX = 64;
	export declare const crypto_generichash_BYTES = 32;
	export declare const crypto_generichash_KEYBYTES_MIN = 16;
	export declare const crypto_generichash_KEYBYTES_MAX = 64;
	export declare const crypto_generichash_KEYBYTES = 32;
	export declare const crypto_generichash_PRIMITIVE = "blake2b";
	export declare const crypto_generichash_blake2b_BYTES_MIN = 16;
	export declare const crypto_generichash_blake2b_BYTES_MAX = 64;
	export declare const crypto_generichash_blake2b_BYTES = 32;
	export declare const crypto_generichash_blake2b_KEYBYTES_MIN = 16;
	export declare const crypto_generichash_blake2b_KEYBYTES_MAX = 64;
	export declare const crypto_generichash_blake2b_KEYBYTES = 32;
	export declare const crypto_generichash_blake2b_SALTBYTES = 16;
	export declare const crypto_generichash_blake2b_PERSONALBYTES = 16;
	export declare const crypto_hash_BYTES = 64;
	export declare const crypto_hash_PRIMITIVE = "sha512";
	export declare const crypto_hash_sha256_BYTES = 32;
	export declare const crypto_hash_sha512_BYTES = 64;
	export declare const crypto_kdf_BYTES_MIN = 16;
	export declare const crypto_kdf_BYTES_MAX = 64;
	export declare const crypto_kdf_CONTEXTBYTES = 8;
	export declare const crypto_kdf_KEYBYTES = 32;
	export declare const crypto_kdf_PRIMITIVE = "blake2b";
	export declare const crypto_kdf_blake2b_BYTES_MIN = 16;
	export declare const crypto_kdf_blake2b_BYTES_MAX = 64;
	export declare const crypto_kdf_blake2b_CONTEXTBYTES = 8;
	export declare const crypto_kdf_blake2b_KEYBYTES = 32;
	export declare const crypto_kx_PUBLICKEYBYTES = 32;
	export declare const crypto_kx_SECRETKEYBYTES = 32;
	export declare const crypto_kx_SEEDBYTES = 32;
	export declare const crypto_kx_SESSIONKEYBYTES = 32;
	export declare const crypto_kx_PRIMITIVE = "x25519blake2b";
	export declare const crypto_onetimeauth_BYTES = 16;
	export declare const crypto_onetimeauth_KEYBYTES = 32;
	export declare const crypto_onetimeauth_PRIMITIVE = "poly1305";
	export declare const crypto_onetimeauth_poly1305_BYTES = 16;
	export declare const crypto_onetimeauth_poly1305_KEYBYTES = 32;
	export declare const crypto_pwhash_ALG_DEFAULT = 2;
	export declare const crypto_pwhash_BYTES_MIN = 16;
	export declare const crypto_pwhash_BYTES_MAX: number;
	export declare const crypto_pwhash_PASSWD_MIN = 0;
	export declare const crypto_pwhash_PASSWD_MAX = 4294967295;
	export declare const crypto_pwhash_SALTBYTES = 16;
	export declare const crypto_pwhash_STRBYTES = 128;
	export declare const crypto_pwhash_STRPREFIX = "$argon2id$";
	export declare const crypto_pwhash_OPSLIMIT_MIN = 1;
	export declare const crypto_pwhash_OPSLIMIT_MAX = 4294967295;
	export declare const crypto_pwhash_MEMLIMIT_MIN = 8192;
	export declare const crypto_pwhash_MEMLIMIT_MAX = 4398046510080;
	export declare const crypto_pwhash_OPSLIMIT_INTERACTIVE = 2;
	export declare const crypto_pwhash_MEMLIMIT_INTERACTIVE = 67108864;
	export declare const crypto_pwhash_OPSLIMIT_MODERATE = 3;
	export declare const crypto_pwhash_MEMLIMIT_MODERATE = 268435456;
	export declare const crypto_pwhash_OPSLIMIT_SENSITIVE = 4;
	export declare const crypto_pwhash_MEMLIMIT_SENSITIVE = 1073741824;
	export declare const crypto_pwhash_PRIMITIVE = "argon2i";
	export declare const crypto_pwhash_argon2i_BYTES_MIN = 16;
	export declare const crypto_pwhash_argon2i_BYTES_MAX = 4294967295;
	export declare const crypto_pwhash_argon2i_PASSWD_MIN = 0;
	export declare const crypto_pwhash_argon2i_PASSWD_MAX = 4294967295;
	export declare const crypto_pwhash_argon2i_SALTBYTES = 16;
	export declare const crypto_pwhash_argon2i_STRBYTES = 128;
	export declare const crypto_pwhash_argon2i_STRPREFIX = "$argon2i$";
	export declare const crypto_pwhash_argon2i_OPSLIMIT_MIN = 3;
	export declare const crypto_pwhash_argon2i_OPSLIMIT_MAX = 4294967295;
	export declare const crypto_pwhash_argon2i_MEMLIMIT_MIN = 8192;
	export declare const crypto_pwhash_argon2i_MEMLIMIT_MAX = 4398046510080;
	export declare const crypto_pwhash_argon2i_OPSLIMIT_INTERACTIVE = 4;
	export declare const crypto_pwhash_argon2i_MEMLIMIT_INTERACTIVE = 33554432;
	export declare const crypto_pwhash_argon2i_OPSLIMIT_MODERATE = 6;
	export declare const crypto_pwhash_argon2i_MEMLIMIT_MODERATE = 134217728;
	export declare const crypto_pwhash_argon2i_OPSLIMIT_SENSITIVE = 8;
	export declare const crypto_pwhash_argon2i_MEMLIMIT_SENSITIVE = 536870912;
	export declare const crypto_pwhash_argon2id_BYTES_MIN = 16;
	export declare const crypto_pwhash_argon2id_BYTES_MAX: number;
	export declare const crypto_pwhash_argon2id_PASSWD_MIN = 0;
	export declare const crypto_pwhash_argon2id_PASSWD_MAX = 4294967295;
	export declare const crypto_pwhash_argon2id_SALTBYTES = 16;
	export declare const crypto_pwhash_argon2id_STRBYTES = 128;
	export declare const crypto_pwhash_argon2id_STRPREFIX = "$argon2id$";
	export declare const crypto_pwhash_argon2id_OPSLIMIT_MIN = 1;
	export declare const crypto_pwhash_argon2id_OPSLIMIT_MAX = 4294967295;
	export declare const crypto_pwhash_argon2id_MEMLIMIT_MIN = 8192;
	export declare const crypto_pwhash_argon2id_MEMLIMIT_MAX = 4398046510080;
	export declare const crypto_pwhash_argon2id_OPSLIMIT_INTERACTIVE = 2;
	export declare const crypto_pwhash_argon2id_MEMLIMIT_INTERACTIVE = 67108864;
	export declare const crypto_pwhash_argon2id_OPSLIMIT_MODERATE = 3;
	export declare const crypto_pwhash_argon2id_MEMLIMIT_MODERATE = 268435456;
	export declare const crypto_pwhash_argon2id_OPSLIMIT_SENSITIVE = 4;
	export declare const crypto_pwhash_argon2id_MEMLIMIT_SENSITIVE = 1073741824;
	export declare const crypto_pwhash_scryptsalsa208sha256_BYTES_MIN = 16;
	export declare const crypto_pwhash_scryptsalsa208sha256_BYTES_MAX: number;
	export declare const crypto_pwhash_scryptsalsa208sha256_PASSWD_MIN = 0;
	export declare const crypto_pwhash_scryptsalsa208sha256_PASSWD_MAX: number;
	export declare const crypto_pwhash_scryptsalsa208sha256_SALTBYTES = 32;
	export declare const crypto_pwhash_scryptsalsa208sha256_STRBYTES = 102;
	export declare const crypto_pwhash_scryptsalsa208sha256_STRPREFIX = "$7$";
	export declare const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_MIN = 32768;
	export declare const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_MAX = 4294967295;
	export declare const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_MIN = 16777216;
	export declare const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_MAX = 68719476736;
	export declare const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_INTERACTIVE = 524288;
	export declare const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_INTERACTIVE = 16777216;
	export declare const crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_SENSITIVE = 33554432;
	export declare const crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_SENSITIVE = 1073741824;
	export declare const crypto_scalarmult_BYTES = 32;
	export declare const crypto_scalarmult_SCALARBYTES = 32;
	export declare const crypto_scalarmult_PRIMITIVE = "curve25519";
	export declare const crypto_scalarmult_curve25519_BYTES = 32;
	export declare const crypto_scalarmult_curve25519_SCALARBYTES = 32;
	export declare const crypto_scalarmult_ed25519_BYTES = 32;
	export declare const crypto_scalarmult_ed25519_SCALARBYTES = 32;
	export declare const crypto_scalarmult_ristretto255_BYTES = 32;
	export declare const crypto_scalarmult_ristretto255_SCALARBYTES = 32;
	export declare const crypto_secretbox_KEYBYTES = 32;
	export declare const crypto_secretbox_NONCEBYTES = 24;
	export declare const crypto_secretbox_MACBYTES = 16;
	export declare const crypto_secretbox_PRIMITIVE = "xsalsa20poly1305";
	export declare const crypto_secretbox_MESSAGEBYTES_MAX: number;
	export declare const crypto_secretbox_ZEROBYTES = 32;
	export declare const crypto_secretbox_BOXZEROBYTES = 16;
	export declare const crypto_secretbox_xchacha20poly1305_KEYBYTES = 32;
	export declare const crypto_secretbox_xchacha20poly1305_NONCEBYTES = 24;
	export declare const crypto_secretbox_xchacha20poly1305_MACBYTES = 16;
	export declare const crypto_secretbox_xchacha20poly1305_MESSAGEBYTES_MAX: number;
	export declare const crypto_secretbox_xsalsa20poly1305_KEYBYTES = 32;
	export declare const crypto_secretbox_xsalsa20poly1305_NONCEBYTES = 24;
	export declare const crypto_secretbox_xsalsa20poly1305_MACBYTES = 16;
	export declare const crypto_secretbox_xsalsa20poly1305_MESSAGEBYTES_MAX: number;
	export declare const crypto_secretbox_xsalsa20poly1305_BOXZEROBYTES = 16;
	export declare const crypto_secretbox_xsalsa20poly1305_ZEROBYTES = 32;
	export declare const crypto_secretstream_xchacha20poly1305_ABYTES = 17;
	export declare const crypto_secretstream_xchacha20poly1305_HEADERBYTES = 24;
	export declare const crypto_secretstream_xchacha20poly1305_KEYBYTES = 32;
	export declare const crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX: bigint;
	export declare const crypto_secretstream_xchacha20poly1305_TAGBYTES = 1;
	export declare const crypto_shorthash_BYTES = 8;
	export declare const crypto_shorthash_KEYBYTES = 16;
	export declare const crypto_shorthash_PRIMITIVE = "siphash24";
	export declare const crypto_shorthash_siphash24_BYTES = 8;
	export declare const crypto_shorthash_siphash24_KEYBYTES = 16;
	export declare const crypto_shorthash_siphashx24_BYTES = 16;
	export declare const crypto_shorthash_siphashx24_KEYBYTES = 16;
	export declare const crypto_sign_BYTES = 64;
	export declare const crypto_sign_SEEDBYTES = 32;
	export declare const crypto_sign_PUBLICKEYBYTES = 32;
	export declare const crypto_sign_SECRETKEYBYTES = 64;
	export declare const crypto_sign_MESSAGEBYTES_MAX: number;
	export declare const crypto_sign_PRIMITIVE = "ed25519";
	export declare const crypto_sign_ed25519_BYTES = 64;
	export declare const crypto_sign_ed25519_SEEDBYTES = 32;
	export declare const crypto_sign_ed25519_PUBLICKEYBYTES = 32;
	export declare const crypto_sign_ed25519_SECRETKEYBYTES = 64;
	export declare const crypto_sign_ed25519_MESSAGEBYTES_MAX: number;
	export declare const crypto_sign_edwards25519sha512batch_BYTES = 64;
	export declare const crypto_sign_edwards25519sha512batch_PUBLICKEYBYTES = 32;
	export declare const crypto_sign_edwards25519sha512batch_SECRETKEYBYTES = 64;
	export declare const crypto_sign_edwards25519sha512batch_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_KEYBYTES = 32;
	export declare const crypto_stream_NONCEBYTES = 24;
	export declare const crypto_stream_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_PRIMITIVE = "xsalsa20";
	export declare const crypto_stream_chacha20_KEYBYTES = 32;
	export declare const crypto_stream_chacha20_NONCEBYTES = 8;
	export declare const crypto_stream_chacha20_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_chacha20_ietf_KEYBYTES = 32;
	export declare const crypto_stream_chacha20_ietf_NONCEBYTES = 12;
	export declare const crypto_stream_chacha20_ietf_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_chacha20_IETF_KEYBYTES = 32;
	export declare const crypto_stream_chacha20_IETF_NONCEBYTES = 12;
	export declare const crypto_stream_chacha20_IETF_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_salsa20_KEYBYTES = 32;
	export declare const crypto_stream_salsa20_NONCEBYTES = 8;
	export declare const crypto_stream_salsa20_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_salsa2012_KEYBYTES = 32;
	export declare const crypto_stream_salsa2012_NONCEBYTES = 8;
	export declare const crypto_stream_salsa2012_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_salsa208_KEYBYTES = 32;
	export declare const crypto_stream_salsa208_NONCEBYTES = 8;
	export declare const crypto_stream_salsa208_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_xchacha20_KEYBYTES = 32;
	export declare const crypto_stream_xchacha20_NONCEBYTES = 24;
	export declare const crypto_stream_xchacha20_MESSAGEBYTES_MAX: number;
	export declare const crypto_stream_xsalsa20_KEYBYTES = 32;
	export declare const crypto_stream_xsalsa20_NONCEBYTES = 24;
	export declare const crypto_stream_xsalsa20_MESSAGEBYTES_MAX: number;
	export declare const crypto_verify_16_BYTES = 16;
	export declare const crypto_verify_32_BYTES = 32;
	export declare const crypto_verify_64_BYTES = 64;
	export declare const randombytes_BYTES_MAX: number;
	export declare const randombytes_SEEDBYTES = 32;

	import { Buffer } from "buffer";
	export declare function sodium_malloc(n: number): Buffer;
	export declare function sodium_free(n: Uint8Array): void;
	export declare function sodium_memzero(n: Uint8Array): void;

	export declare function crypto_generichash_batch(
		out: Uint8Array,
		inArray: Uint8Array[],
		key?: Uint8Array | null,
	): void;
	declare class GenerichashInstance {
		private state;
		constructor(key?: Uint8Array | null, outlen?: number);
		update(inp: Uint8Array): void;
		final(out: Uint8Array): void;
	}
	export declare function crypto_generichash_instance(
		key: Uint8Array | null,
		outlen: number,
	): GenerichashInstance;

	import { Buffer } from "buffer";
	export declare function crypto_aead_chacha20poly1305_encrypt(
		c: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_decrypt(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_encrypt_detached(
		c: Uint8Array,
		mac: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_decrypt_detached(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		mac: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_aead_chacha20poly1305_keygen(
		k: Uint8Array,
	): void;
	export declare function crypto_aead_chacha20poly1305_ietf_encrypt(
		c: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_ietf_decrypt(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_ietf_encrypt_detached(
		c: Uint8Array,
		mac: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_chacha20poly1305_ietf_decrypt_detached(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		mac: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_aead_chacha20poly1305_ietf_keygen(
		k: Uint8Array,
	): void;
	export declare function crypto_aead_xchacha20poly1305_ietf_encrypt(
		c: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_xchacha20poly1305_ietf_decrypt(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_xchacha20poly1305_ietf_encrypt_detached(
		c: Uint8Array,
		mac: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		nsec: null,
		npub: Uint8Array,
		k: Uint8Array,
	): number;
	export declare function crypto_aead_xchacha20poly1305_ietf_decrypt_detached(
		m: Uint8Array,
		nsec: null,
		c: Uint8Array,
		mac: Uint8Array,
		ad: Uint8Array | null,
		npub: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_aead_xchacha20poly1305_ietf_keygen(
		k: Uint8Array,
	): void;
	export declare function crypto_auth(
		out: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_auth_verify(
		h: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): boolean;
	export declare function crypto_auth_keygen(k: Uint8Array): void;
	export declare function crypto_box_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
	): number;
	export declare function crypto_box_seed_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
		seed: Uint8Array,
	): void;
	export declare function crypto_box_easy(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		pk: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_box_open_easy(
		m: Uint8Array,
		c: Uint8Array,
		n: Uint8Array,
		pk: Uint8Array,
		sk: Uint8Array,
	): boolean;
	export declare function crypto_box_detached(
		c: Uint8Array,
		mac: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		pk: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_box_open_detached(
		m: Uint8Array,
		c: Uint8Array,
		mac: Uint8Array,
		n: Uint8Array,
		pk: Uint8Array,
		sk: Uint8Array,
	): boolean;
	export declare function crypto_core_ed25519_is_valid_point(
		p: Uint8Array,
	): boolean;
	export declare function crypto_core_ed25519_random(p: Uint8Array): void;
	export declare function crypto_core_ed25519_from_uniform(
		p: Uint8Array,
		r: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_add(
		r: Uint8Array,
		p: Uint8Array,
		q: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_sub(
		r: Uint8Array,
		p: Uint8Array,
		q: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_random(
		r: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_reduce(
		r: Uint8Array,
		s: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_invert(
		recip: Uint8Array,
		s: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_negate(
		neg: Uint8Array,
		s: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_complement(
		comp: Uint8Array,
		s: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_add(
		z: Uint8Array,
		x: Uint8Array,
		y: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_sub(
		z: Uint8Array,
		x: Uint8Array,
		y: Uint8Array,
	): void;
	export declare function crypto_core_ed25519_scalar_mul(
		z: Uint8Array,
		x: Uint8Array,
		y: Uint8Array,
	): void;
	export declare const crypto_generichash_STATEBYTES: any;
	export declare function crypto_generichash(
		out: Uint8Array,
		inp: Uint8Array,
		key: Uint8Array | null,
	): void;
	export declare function crypto_generichash_init(
		state: Uint8Array,
		key: Uint8Array | null,
		outlen: number,
	): void;
	export declare function crypto_generichash_update(
		state: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_generichash_final(
		state: Uint8Array,
		out: Uint8Array,
	): void;
	export declare function crypto_generichash_keygen(k: Uint8Array): void;
	export declare function crypto_hash(
		out: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare const crypto_hash_sha256_STATEBYTES: any;
	export declare function crypto_hash_sha256(
		out: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_hash_sha256_init(state: Uint8Array): void;
	export declare function crypto_hash_sha256_update(
		state: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_hash_sha256_final(
		state: Uint8Array,
		out: Uint8Array,
	): void;
	export declare const crypto_hash_sha512_STATEBYTES: any;
	export declare function crypto_hash_sha512(
		out: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_hash_sha512_init(state: Uint8Array): void;
	export declare function crypto_hash_sha512_update(
		state: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_hash_sha512_final(
		state: Uint8Array,
		out: Uint8Array,
	): void;
	export declare function crypto_kdf_keygen(key: Uint8Array): void;
	export declare function crypto_kdf_derive_from_key(
		subkey: Uint8Array,
		subkey_id: number,
		ctx: Uint8Array,
		key: Uint8Array,
	): void;
	export declare function crypto_kx_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_kx_seed_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
		seed: Uint8Array,
	): void;
	export declare function crypto_kx_client_session_keys(
		rx: Uint8Array,
		tx: Uint8Array,
		client_pk: Uint8Array,
		client_sk: Uint8Array,
		server_pk: Uint8Array,
	): void;
	export declare function crypto_kx_server_session_keys(
		rx: Uint8Array,
		tx: Uint8Array,
		server_pk: Uint8Array,
		server_sk: Uint8Array,
		client_pk: Uint8Array,
	): void;
	export declare const crypto_onetimeauth_STATEBYTES: any;
	export declare function crypto_onetimeauth(
		out: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_onetimeauth_verify(
		h: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): boolean;
	export declare function crypto_onetimeauth_init(
		state: Uint8Array,
		key: Uint8Array,
	): void;
	export declare function crypto_onetimeauth_update(
		state: Uint8Array,
		inp: Uint8Array,
	): void;
	export declare function crypto_onetimeauth_final(
		state: Uint8Array,
		out: Uint8Array,
	): void;
	export declare function crypto_onetimeauth_keygen(k: Uint8Array): void;
	export declare const crypto_pwhash_ALG_ARGON2I13 = 1;
	export declare const crypto_pwhash_ALG_ARGON2ID13 = 2;
	export declare function crypto_pwhash(
		out: Uint8Array,
		passwd: Uint8Array,
		salt: Uint8Array,
		opslimit: number,
		memlimit: number,
		alg: number,
	): void;
	export declare function crypto_pwhash_str(
		out: Uint8Array,
		passwd: Uint8Array,
		opslimit: number,
		memlimit: number,
	): void;
	export declare function crypto_pwhash_str_verify(
		str: Uint8Array,
		passwd: Uint8Array,
	): boolean;
	export declare function crypto_pwhash_str_needs_rehash(
		str: Uint8Array,
		opslimit: number,
		memlimit: number,
	): boolean;
	export declare function crypto_pwhash_scryptsalsa208sha256(
		out: Uint8Array,
		passwd: Uint8Array,
		salt: Uint8Array,
		opslimit: number,
		memlimit: number,
	): void;
	export declare function crypto_pwhash_scryptsalsa208sha256_str(
		out: Uint8Array,
		passwd: Uint8Array,
		opslimit: number,
		memlimit: number,
	): void;
	export declare function crypto_pwhash_scryptsalsa208sha256_str_verify(
		str: Uint8Array,
		passwd: Uint8Array,
	): boolean;
	export declare function crypto_pwhash_scryptsalsa208sha256_str_needs_rehash(
		str: Uint8Array,
		opslimit: number,
		memlimit: number,
	): boolean;
	export declare function crypto_scalarmult_base(
		q: Uint8Array,
		n: Uint8Array,
	): void;
	export declare function crypto_scalarmult(
		q: Uint8Array,
		n: Uint8Array,
		p: Uint8Array,
	): void;
	export declare function crypto_scalarmult_ed25519(
		q: Uint8Array,
		n: Uint8Array,
		p: Uint8Array,
	): void;
	export declare function crypto_scalarmult_ed25519_base(
		q: Uint8Array,
		n: Uint8Array,
	): void;
	export declare function crypto_scalarmult_ed25519_noclamp(
		q: Uint8Array,
		n: Uint8Array,
		p: Uint8Array,
	): void;
	export declare function crypto_scalarmult_ed25519_base_noclamp(
		q: Uint8Array,
		n: Uint8Array,
	): void;
	export declare function crypto_secretbox_easy(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_secretbox_open_easy(
		m: Uint8Array,
		c: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): boolean;
	export declare function crypto_secretbox_detached(
		c: Uint8Array,
		mac: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_secretbox_open_detached(
		m: Uint8Array,
		c: Uint8Array,
		mac: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): boolean;
	export declare function crypto_secretbox_keygen(k: Uint8Array): void;
	export declare const crypto_secretstream_xchacha20poly1305_TAG_MESSAGE: Buffer;
	export declare const crypto_secretstream_xchacha20poly1305_TAG_PUSH: Buffer;
	export declare const crypto_secretstream_xchacha20poly1305_TAG_REKEY: Buffer;
	export declare const crypto_secretstream_xchacha20poly1305_TAG_FINAL: Buffer;
	export declare function crypto_secretstream_xchacha20poly1305_keygen(
		k: Uint8Array,
	): void;
	export declare const crypto_secretstream_xchacha20poly1305_STATEBYTES: any;
	export declare function crypto_secretstream_xchacha20poly1305_init_push(
		state: Uint8Array,
		header: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_secretstream_xchacha20poly1305_push(
		state: Uint8Array,
		c: Uint8Array,
		m: Uint8Array,
		ad: Uint8Array | null,
		tag: Uint8Array,
	): number;
	export declare function crypto_secretstream_xchacha20poly1305_init_pull(
		state: Uint8Array,
		header: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_secretstream_xchacha20poly1305_pull(
		state: Uint8Array,
		m: Uint8Array,
		tag: Uint8Array,
		c: Uint8Array,
		ad: Uint8Array | null,
	): number;
	export declare function crypto_secretstream_xchacha20poly1305_rekey(
		state: Uint8Array,
	): void;
	export declare function crypto_shorthash_keygen(k: Uint8Array): void;
	export declare function crypto_shorthash(
		out: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_shorthash_siphashx24(
		out: Uint8Array,
		inp: Uint8Array,
		k: Uint8Array,
	): void;
	export declare const crypto_sign_STATEBYTES: any;
	export declare function crypto_sign_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_sign_seed_keypair(
		pk: Uint8Array,
		sk: Uint8Array,
		seed: Uint8Array,
	): void;
	export declare function crypto_sign(
		sm: Uint8Array,
		m: Uint8Array,
		sk: Uint8Array,
	): number;
	export declare function crypto_sign_open(
		m: Uint8Array,
		sm: Uint8Array,
		pk: Uint8Array,
	): boolean;
	export declare function crypto_sign_detached(
		sig: Uint8Array,
		m: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_sign_verify_detached(
		sig: Uint8Array,
		m: Uint8Array,
		pk: Uint8Array,
	): boolean;
	export declare function crypto_sign_ed25519_sk_to_pk(
		pk: Uint8Array,
		sk: Uint8Array,
	): void;
	export declare function crypto_sign_ed25519_pk_to_curve25519(
		x25519_pk: Uint8Array,
		ed25519_pk: Uint8Array,
	): void;
	export declare function crypto_sign_ed25519_sk_to_curve25519(
		x25519_sk: Uint8Array,
		ed25519_sk: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20(
		c: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20_xor(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20_xor_ic(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		ic: number,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20_ietf(
		c: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20_ietf_xor(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_chacha20_ietf_xor_ic(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		ic: number,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_xchacha20(
		c: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_xchacha20_xor(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_xchacha20_xor_ic(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		ic: number,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_salsa20(
		c: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_salsa20_xor(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		k: Uint8Array,
	): void;
	export declare function crypto_stream_salsa20_xor_ic(
		c: Uint8Array,
		m: Uint8Array,
		n: Uint8Array,
		ic: number,
		k: Uint8Array,
	): void;
	export declare function randombytes_random(): number;
	export declare function randombytes_uniform(upper_bound: number): number;
	export declare function randombytes_buf(buf: Uint8Array): void;
	export declare function randombytes_buf_deterministic(
		buf: Uint8Array,
		seed: Uint8Array,
	): void;
	export declare function sodium_memcmp(
		b1_: Uint8Array,
		b2_: Uint8Array,
	): boolean;
	export declare function sodium_increment(n: Uint8Array): void;
	export declare function sodium_add(a: Uint8Array, b: Uint8Array): void;
	export declare function sodium_sub(a: Uint8Array, b: Uint8Array): void;
	export declare function sodium_compare(
		b1_: Uint8Array,
		b2_: Uint8Array,
	): number;
	export declare function sodium_is_zero(n: Uint8Array): boolean;
	export declare function sodium_pad(
		buf: Uint8Array,
		unpaddedLength: number,
		blocksize: number,
	): number;
	export declare function sodium_unpad(
		buf: Uint8Array,
		paddedLength: number,
		blocksize: number,
	): number;
	export declare function crypto_box_seal(
		c: Uint8Array,
		m: Uint8Array,
		pk: Uint8Array,
	): void;
	export declare function crypto_box_seal_open(
		m: Uint8Array,
		c: Uint8Array,
		pk: Uint8Array,
		sk: Uint8Array,
	): boolean;
}
