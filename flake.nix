{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      python = pkgs.python3.withPackages (ps: [ ps.pillow ]);

      icons = pkgs.runCommand "icons" { nativeBuildInputs = [ python ]; } ''
        mkdir -p $out
        python ${./src/main.py} $out
      '';

    in
    {
      packages.${system}.default = icons;

      apps.${system}.default = {
        type = "app";
        program = toString (
          pkgs.writeShellScript "deploy" ''
            cp -rL --no-preserve=mode ${icons}/. dest/
          ''
        );
      };

      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          python
          ruff
          pyright
        ];
      };
    };
}
