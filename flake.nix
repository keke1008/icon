{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      eachSystem =
        let
          mkSystemArgs = system: pkgs: rec {
            inherit system pkgs;
            python = pkgs.python3.withPackages (ps: [ ps.pillow ]);
          };
          systemArgs = builtins.mapAttrs mkSystemArgs nixpkgs.legacyPackages;
        in
        f: builtins.mapAttrs (_: f) systemArgs;
    in
    {
      packages = eachSystem (
        { pkgs, python, ... }:
        {
          default = pkgs.runCommand "icons" { nativeBuildInputs = [ python ]; } ''
            mkdir -p $out
            python ${./src/main.py} $out
          '';

          previewer = pkgs.writeShellApplication {
            name = "icon-previewer";
            runtimeInputs = [ python ];
            text = "python -m http.server -d ${./src/previewer}";
          };
        }
      );

      apps = eachSystem (
        { pkgs, system, ... }: {
          default = {
            type = "app";
            program = toString (
              pkgs.writeShellScript "deploy" ''
                cp -rL --no-preserve=mode ${self.packages."${system}".default}/. dest/
              ''
            );
          };
        }
      );

      devShells = eachSystem (
        { pkgs, python, ... }: {
          default = pkgs.mkShell {
            packages = with pkgs; [
              python
              ruff
              pyright
              typescript
              typescript-language-server
              biome
            ];
          };
        }
      );
    };
}
